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
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';

/**
 *
 * Renders the operation summary and description sections
 * @export
 * @param {*} props
 * @returns
 */
export default function DescriptionAndSummary(props) {
    const {
        operation, operationsDispatcher, disableUpdate, target, verb,
    } = props;
    const intl = useIntl();
    return (
        <>
            <Grid item xs={12} md={12}>
                <Typography variant='subtitle1'>
                    <FormattedMessage
                        id='Apis.Details.Resources.Operation.Components.Summary.title'
                        defaultMessage='Summary'
                    />
                    {' '}
                    &lsquo;&#38;&rsquo;
                    {' '}
                    <FormattedMessage
                        id='Apis.Details.Resources.Operation.Components.Description.title'
                        defaultMessage='Description'
                    />
                    <Divider variant='middle' />
                </Typography>
            </Grid>
            <Grid item md={1} />
            <Grid item md={5}>
                <TextField
                    margin='dense'
                    fullWidth
                    label={intl.formatMessage({
                        id: 'Apis.Details.Resources.Operation.Components.Description',
                        defaultMessage: 'Description',
                    })}
                    multiline
                    disabled={disableUpdate}
                    rows='4'
                    value={operation.description}
                    variant='outlined'
                    data-testid={'description-' + verb + target}
                    onChange={
                        ({ target: { value } }) => operationsDispatcher(
                            { action: 'description', data: { target, verb, value } },
                        )
                    }
                />
            </Grid>
            <Grid item md={5}>
                <TextField
                    label={intl.formatMessage({
                        id: 'Apis.Details.Resources.Operation.Components.Summary',
                        defaultMessage: 'Summary',
                    })}
                    margin='dense'
                    variant='outlined'
                    fullWidth
                    disabled={disableUpdate}
                    multiline
                    rows='4'
                    value={operation.summary}
                    data-testid={'summary-' + verb + target}
                    onChange={({ target: { value } }) => operationsDispatcher(
                        { action: 'summary', data: { target, verb, value } },
                    )}
                />
            </Grid>
            <Grid item md={1} />
        </>
    );
}

DescriptionAndSummary.propTypes = {
    disableUpdate: PropTypes.bool,
    operation: PropTypes.shape({
        target: PropTypes.string.isRequired,
        verb: PropTypes.string.isRequired,
        spec: PropTypes.shape({}).isRequired,
    }).isRequired,
    operationsDispatcher: PropTypes.func.isRequired,
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
};

DescriptionAndSummary.defaultProps = {
    disableUpdate: false,
};
