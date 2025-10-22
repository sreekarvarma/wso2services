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
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpOutline from '@mui/icons-material/HelpOutline';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import TextField from '@mui/material/TextField';

const PREFIX = 'ResponseCaching';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    actionSpace: `${PREFIX}-actionSpace`,
    subHeading: `${PREFIX}-subHeading`,
    paper: `${PREFIX}-paper`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
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

    [`& .${classes.paper}`]: {
        padding: theme.spacing(0, 3),
    }
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ResponseCaching(props) {
    const { api, configDispatcher } = props;

    const [apiFromContext] = useAPI();
    const isResponseCachingEnabled = api.responseCachingEnabled;

    const generateElement = (isEnabled) => {
        if (isEnabled) {
            return (
                <ExpandMoreIcon />
            );
        }
        return (null);
    };

    return (
        (<Root>
            <WrappedExpansionPanel className={classes.expansionPanel} id='responseCaching'>
                <AccordionSummary expandIcon={generateElement(api.responseCachingEnabled)}>
                    <Typography className={classes.subHeading} variant='h6' component='h4'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.Configuration.response.caching'
                            defaultMessage='Response Caching'
                        />
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.ResponseCaching.tooltip'
                                    defaultMessage={
                                        'If enabled, the API response will be cached at the gateway level'
                                        + ' to improve the response time and minimize the backend load'
                                    }
                                />
                            )}
                            aria-label='Response caching helper text'
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
                                id='response-caching-switch'
                                disabled={
                                    isRestricted(['apim:api_create'], apiFromContext) ||
                                    apiFromContext.subtypeConfiguration?.subtype.includes('AIAPI')
                                }
                                checked={api.responseCachingEnabled}
                                onChange={({ target: { checked } }) => configDispatcher({
                                    action: 'responseCachingEnabled',
                                    value: checked,
                                })}
                                color='primary'
                                inputProps={{
                                    'aria-label': 'switch response caching',
                                }}
                            />
                        )}
                    />
                </AccordionSummary>
                <AccordionDetails className={classes.expansionPanelDetails}>
                    <Grid container spacing={1} alignItems='flex-start'>
                        <Grid item>
                            {isResponseCachingEnabled && (
                                <TextField
                                    value={api.cacheTimeout}
                                    onChange={({ target: { value } }) => configDispatcher({
                                        action: 'cacheTimeout',
                                        value,
                                    })}
                                    margin='normal'
                                    helperText={(
                                        <FormattedMessage
                                            id='Apis.Details.Configuration.Configuration.cache.timeout'
                                            defaultMessage='Cache Timeout (seconds)'
                                        />
                                    )}
                                />
                            )}
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </WrappedExpansionPanel>
        </Root>)
    );
}

ResponseCaching.propTypes = {
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
