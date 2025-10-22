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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import ChipInput from 'AppComponents/Shared/ChipInput'; // DEPRECATED: Do not COPY and use this component.
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';

const PREFIX = 'CORSConfiguration';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    actionSpace: `${PREFIX}-actionSpace`,
    subHeading: `${PREFIX}-subHeading`
};

const StyledWrappedExpansionPanel = styled(WrappedExpansionPanel)((
    {
        theme
    }
) => ({
    [`&.${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.actionSpace}`]: {
        marginLeft: theme.spacing(20),
        marginTop: '-7px',
        marginBottom: '-7px',
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    }
}));

/**
 *
 * api.corsConfiguration possible values true and false
 * @export
 * @param {*} props
 * @returns
 */
export default function CORSConfiguration(props) {
    const [apiFromContext] = useAPI();
    const {
        configDispatcher,
        api: { corsConfiguration },
    } = props;
    const intl = useIntl();
    const isCorsEnabled = corsConfiguration.corsConfigurationEnabled;
    const isAllowAllOrigins = corsConfiguration.accessControlAllowOrigins[0] === '*'
        && corsConfiguration.accessControlAllowOrigins.length === 1;

    const generateElement = (isEnabled) => {
        if (isEnabled) {
            return (
                <ExpandMoreIcon />
            );
        }
        return (null);
    };
    return (
        <StyledWrappedExpansionPanel className={classes.expansionPanel} id='corsConfiguration'>
            <AccordionSummary expandIcon={generateElement(corsConfiguration.corsConfigurationEnabled)}>
                <Typography className={classes.subHeading} variant='h6' component='h4'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.CORSConfiguration.cors.configuration'
                        defaultMessage='CORS Configuration'
                    />
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.CORSConfiguration.tooltip'
                                defaultMessage='If enabled, the CORS configuration for the API will be enabled.'
                            />
                        )}
                        aria-label='CORS Configuration helper text'
                        placement='right-end'
                        interactive
                    >
                        <HelpOutline className={classes.iconSpace} />
                    </Tooltip>
                </Typography>
                <FormControlLabel
                    className={classes.actionSpace}
                    control={(
                        <Switch
                            disabled={isRestricted(['apim:api_create'], apiFromContext)}
                            checked={corsConfiguration.corsConfigurationEnabled}
                            onChange={({ target: { checked } }) => configDispatcher({
                                action: 'corsConfigurationEnabled',
                                value: checked,
                            })}
                            color='primary'
                            inputProps={{
                                'aria-label': 'CORS Configuration',
                            }}
                        />
                    )}
                />
            </AccordionSummary>
            <AccordionDetails className={classes.expansionPanelDetails}>
                <Grid container>
                    <Grid item md={12}>
                        {isCorsEnabled && (
                            <Grid container>
                                <Grid item md={12}>
                                    <Typography variant='subtitle1'>
                                        <FormattedMessage
                                            id={'Apis.Details.Configuration.components.CORSConfiguration.allow.'
                                                + 'origins'}
                                            defaultMessage='Access Control Allow Origins'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item md={12}>
                                    <Grid container>
                                        <Grid item md={12}>
                                            <FormControlLabel
                                                style={{ display: 'flex' }}
                                                control={(
                                                    <Checkbox
                                                        disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                        checked={isAllowAllOrigins}
                                                        onChange={({ target: { checked, value } }) => configDispatcher({
                                                            action: 'accessControlAllowOrigins',
                                                            event: { checked, value },
                                                        })}
                                                        value='*'
                                                        color='primary'
                                                    />
                                                )}
                                                label={intl.formatMessage({
                                                    id: 'Apis.Details.Configuration.components.CORSConfiguration.'
                                                        + 'allow.all.origins',
                                                    defaultMessage: 'Allow All Origins',
                                                })}
                                            />
                                        </Grid>
                                        {!isAllowAllOrigins && (
                                            <Grid item md={12}>
                                                <ChipInput
                                                    style={{ marginBottom: 40, display: 'flex' }}
                                                    value={corsConfiguration.accessControlAllowOrigins}
                                                    helperText={(
                                                        <FormattedMessage
                                                            id={
                                                                'Apis.Details.Configuration.components'
                                                                + '.CORSConfigurations.origin.helper'
                                                            }
                                                            defaultMessage={
                                                                'Press `Enter` after typing the origin name,'
                                                                + 'to add a new origin'
                                                            }
                                                        />
                                                    )}
                                                    onAdd={(accessControlAllowOrigin) => {
                                                        configDispatcher({
                                                            action: 'accessControlAllowOrigins',
                                                            event: {
                                                                value: [
                                                                    ...corsConfiguration.accessControlAllowOrigins,
                                                                    accessControlAllowOrigin,
                                                                ],
                                                            },
                                                        });
                                                    }}
                                                    onDelete={(accessControlAllowOrigin) => {
                                                        configDispatcher({
                                                            action: 'accessControlAllowOrigins',
                                                            event: {
                                                                value: corsConfiguration
                                                                    .accessControlAllowOrigins
                                                                    .filter(
                                                                        (oldOrigin) => (
                                                                            oldOrigin !== accessControlAllowOrigin),
                                                                    ),
                                                            },
                                                        });
                                                    }}
                                                />
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>
                                <Grid item md={12}>
                                    <Typography variant='subtitle1'>
                                        <FormattedMessage
                                            id={'Apis.Details.Configuration.components.CORSConfiguration.allow.'
                                                    + 'headers'}
                                            defaultMessage='Access Control Allow Headers'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item md={12}>
                                    <ChipInput
                                        style={{ marginBottom: 40, display: 'flex' }}
                                        value={corsConfiguration.accessControlAllowHeaders}
                                        disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                        helperText={(
                                            <FormattedMessage
                                                id={
                                                    'Apis.Details.Configuration.components.'
                                                    + 'CORSConfigurations.header.helper'
                                                }
                                                defaultMessage={
                                                    'Press `Enter` after typing the header name, '
                                                    + 'to add a new header'
                                                }
                                            />
                                        )}
                                        onAdd={(accessControlAllowHeader) => {
                                            configDispatcher({
                                                action: 'accessControlAllowHeaders',
                                                value: [
                                                    ...corsConfiguration.accessControlAllowHeaders,
                                                    accessControlAllowHeader,
                                                ],
                                            });
                                        }}
                                        onDelete={(accessControlAllowHeader) => {
                                            configDispatcher({
                                                action: 'accessControlAllowHeaders',
                                                value: corsConfiguration.accessControlAllowHeaders
                                                    .filter((oldHeader) => oldHeader !== accessControlAllowHeader),
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item md={12}>
                                    <Typography variant='subtitle1'>
                                        <FormattedMessage
                                            id={'Apis.Details.Configuration.components.CORSConfiguration.allow.'
                                                    + 'methods'}
                                            defaultMessage='Access Control Allow Methods'
                                        />
                                    </Typography>
                                </Grid>
                                <Grid item md={12}>
                                    <ChipInput
                                        style={{ marginBottom: 40, display: 'flex' }}
                                        value={corsConfiguration.accessControlAllowMethods}
                                        disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                        helperText={(
                                            <FormattedMessage
                                                id={
                                                    'Apis.Details.Configuration.components'
                                                    + '.CORSConfigurations.method.helper'
                                                }
                                                defaultMessage={
                                                    'Press `Enter` after typing the method name,'
                                                    + ' to add a new method'
                                                }
                                            />
                                        )}
                                        onAdd={(newValue) => {
                                            let value = [...corsConfiguration.accessControlAllowMethods,
                                                newValue.toUpperCase()];
                                            if (
                                                corsConfiguration
                                                    .accessControlAllowMethods
                                                    .find((method) => method === newValue.toUpperCase())
                                            ) {
                                                value = [...corsConfiguration.accessControlAllowMethods];
                                            }
                                            configDispatcher({
                                                action: 'accessControlAllowMethods',
                                                value,
                                            });
                                        }}
                                        onDelete={(accessControlAllowMethod) => {
                                            configDispatcher({
                                                action: 'accessControlAllowMethods',
                                                value: corsConfiguration
                                                    .accessControlAllowMethods
                                                    .filter((oldMethod) => oldMethod !== accessControlAllowMethod),
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <FormControlLabel
                                        control={(
                                            <Checkbox
                                                disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                                checked={corsConfiguration.accessControlAllowCredentials}
                                                onChange={({ target: { checked } }) => configDispatcher({
                                                    action: 'accessControlAllowCredentials',
                                                    value: checked,
                                                })}
                                                color='primary'
                                            />
                                        )}
                                        label={(
                                            <FormattedMessage
                                                id={
                                                    'Apis.Details.Configuration.components'
                                                    + '.CORSConfiguration.allow.credentials'
                                                }
                                                defaultMessage='Access Control Allow Credentials'
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </AccordionDetails>
        </StyledWrappedExpansionPanel>
    );
}

CORSConfiguration.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
