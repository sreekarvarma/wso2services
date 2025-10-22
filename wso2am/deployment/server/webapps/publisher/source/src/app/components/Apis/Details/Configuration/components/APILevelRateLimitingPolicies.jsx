/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';

const PREFIX = 'APILevelRateLimitingPolicies';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    actionSpace: `${PREFIX}-actionSpace`,
    subHeading: `${PREFIX}-subHeading`,
    keyManagerSelect: `${PREFIX}-keyManagerSelect`
};

const StyledAccordion = styled(Accordion)((
    {
        theme
    }
) => ({
    [`&.${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
        display: 'inline-flex',
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.actionSpace}`]: {
        margin: '-7px auto',
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
    },

    [`& .${classes.keyManagerSelect}`]: {
        minWidth: 180,
    }
}));

/**
 *
 * API Level Rate Limiting configuration
 * @param {*} props
 * @returns
 */
export default function APILevelRateLimitingPolicies(props) {
    const [apiFromContext] = useAPI();
    const intl = useIntl();
    const {
        configDispatcher,
        api: { apiThrottlingPolicy },
    } = props;
    const [apiRateLimits, setApiRateLimits] = useState([]);
    const handleChange = (event) => {
        configDispatcher({
            action: 'apiThrottlingPolicy',
            value: event.target.value,
        });
    };

    useEffect(() => {
        API.policies('api').then((response) => setApiRateLimits(response.body.list));
    }, []);

    return (
        <StyledAccordion className={classes.expansionPanel} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.subHeading} variant='h6'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.APILevelRateLimitingPolicies.configuration'
                        defaultMessage='Rate Limiting Configuration'
                    />
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.APILevelRateLimitingPolicies.components.Configuration.tooltip'
                                defaultMessage={'Selected Rate Limiting Policy will be applied to all the'
                                + ' requests of this API.'}
                            />
                        )}
                        aria-label='Rate Limiting Policies'
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
                            checked={!(apiThrottlingPolicy === null)}
                            onChange={({ target: { checked } }) => configDispatcher({
                                action: 'throttlingPoliciesEnabled',
                                value: checked,
                            })}
                            color='primary'
                        />
                    )}
                />
            </AccordionSummary>
            <AccordionDetails className={classes.expansionPanelDetails}>
                <Grid container spacing={1} alignItems='center'>
                    <Grid item md={6} xs={12}>
                        {!(apiThrottlingPolicy === null) && (
                            <TextField
                                disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                id='operation_throttling_policy'
                                select
                                value={apiThrottlingPolicy}
                                onChange={handleChange}
                                label={intl.formatMessage({
                                    id: 'Apis.Details.Rate.Limiting.rate.limiting.policies',
                                    defaultMessage: 'Rate limiting policies',
                                })}
                                margin='dense'
                                variant='outlined'
                                style={{ display: 'flex', minWidth: 180 }}
                            >
                                {apiRateLimits.map((rateLimit) => (
                                    <MenuItem key={rateLimit.name} value={rateLimit.name}>
                                        {rateLimit.displayName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Grid>
                </Grid>
            </AccordionDetails>
        </StyledAccordion>
    );
}

APILevelRateLimitingPolicies.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
