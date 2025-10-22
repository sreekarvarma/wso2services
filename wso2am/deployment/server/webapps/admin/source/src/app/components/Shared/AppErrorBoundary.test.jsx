/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { unwrap } from '@mui/material/test-utils';
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';

import Themes from 'Themes';
import AppErrorBoundary from './AppErrorBoundary';

const UnwrappedAppErrorBoundary = unwrap(AppErrorBoundary);
describe('AppErrorBoundary test', () => {
    test('Should return the child element when no exception is thrown', () => {
        const Child = <div>Testing child</div>;
        const Test = <UnwrappedAppErrorBoundary classes={{}}>{Child}</UnwrappedAppErrorBoundary>;
        const shallowRendered = shallow(Test);
        expect(shallowRendered.contains(Child)).toBeTruthy();
    });

    test('should return error boundary HTML', () => {
        const message = 'Error boundary test error';
        const { light } = Themes;
        const TestError = () => {
            throw new Error(message);
        };
        const TestComponent = (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={createTheme(adaptV4Theme(light))}>
                    <AppErrorBoundary>
                        <TestError />
                    </AppErrorBoundary>
                </ThemeProvider>
            </StyledEngineProvider>
        );

        const wrapper = mount(TestComponent);
        const renderedAppErrorBoundary = wrapper.find(AppErrorBoundary);
        expect(renderedAppErrorBoundary.contains(message)).toBeTruthy();
        // Check the error message string
        expect(renderedAppErrorBoundary.children().contains('Something went wrong')).toBeTruthy();

        expect(renderedAppErrorBoundary.children().state().hasError).toBeTruthy();
        expect(renderedAppErrorBoundary.children().state().error).not.toBeNull();
        expect(renderedAppErrorBoundary.children().state().error.message).not.toBeNull();
        expect(renderedAppErrorBoundary.children().state().error.message).toEqual(message);
    });
});
