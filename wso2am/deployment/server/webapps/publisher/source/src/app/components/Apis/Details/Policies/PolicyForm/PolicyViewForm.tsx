/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { FC } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import type { PolicySpec, PolicySpecAttribute } from '../Types';
import PolicyAttributes from './PolicyAttributes';
import GeneralDetails from './GeneralDetails';
import SourceDetails from './SourceDetails';
import uuidv4 from '../Utils';

const PREFIX = 'PolicyViewForm';

const classes = {
    root: `${PREFIX}-root`
};

const StyledPaper = styled(Paper)(() => ({
    [`&.${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    }
}));

interface PolicyViewFormProps {
    policySpec: PolicySpec;
    onDone: () => void;
}

/**
 * Renders the policy view form.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Right drawer for policy configuration.
 */
const PolicyViewForm: FC<PolicyViewFormProps> = ({ policySpec, onDone }) => {


    const getPolicyAttributes = () => {
        const policyAttributeList = policySpec.policyAttributes.map(
            (attribute: PolicySpecAttribute) => {
                return { ...attribute, id: uuidv4() };
            },
        );
        return policyAttributeList;
    };

    return (
        <StyledPaper elevation={0} className={classes.root}>
            {/* General details of policy */}
            <GeneralDetails
                displayName={policySpec.displayName}
                version={policySpec.version}
                description={policySpec.description}
                applicableFlows={policySpec.applicableFlows}
                supportedApiTypes={policySpec.supportedApiTypes}
                isViewMode
            />
            <Divider />
            {/* Gateway specific details of policy */}
            <SourceDetails
                supportedGateways={policySpec.supportedGateways}
                isViewMode
                policyId={policySpec.id}
                isAPISpecific={policySpec.isAPISpecific}
            />
            <Divider />
            {/* Attributes of policy */}
            <PolicyAttributes
                policyAttributes={getPolicyAttributes()}
                isViewMode
            />
            <Box>
                <Button variant='contained' color='primary' data-testid='done-view-policy-file' onClick={onDone}>
                    <FormattedMessage
                        id='Apis.Details.Policies.PolicyForm.PolicyViewForm.done'
                        defaultMessage='Done'
                    />
                </Button>
            </Box>
        </StyledPaper>
    );
};

export default PolicyViewForm;
