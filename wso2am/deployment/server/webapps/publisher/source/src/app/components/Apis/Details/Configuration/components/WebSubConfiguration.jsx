/*
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControlLabel from '@mui/material/FormControlLabel';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Checkbox from '@mui/material/Checkbox';

const PREFIX = 'WebSubConfiguration';

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
        marginLeft: '0px',
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
 * api.webSubConfiguration possible values true and false
 * @export
 * @param {*} props
 * @returns
 */
export default function WebSubConfiguration(props) {
    const { api, configDispatcher } = props;
    const { api: apiFromContext } = useAPI();

    return (
        <StyledWrappedExpansionPanel className={classes.expansionPanel} id='webSubConfiguration'>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.subHeading} variant='h6' component='h4'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.components.WebSubConfiguration.configuration'
                        defaultMessage='WebSub Configuration'
                    />
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.expansionPanelDetails}>
                <Grid container>
                    <Grid item>
                        <FormControlLabel
                            className={classes.actionSpace}
                            label={(
                                <Typography>
                                    <FormattedMessage
                                        id={
                                            'Apis.Details.Configuration.components.WebSubConfiguration.configuration'
                                            + '.subVerification'
                                        }
                                        defaultMessage='Enable subscriber verification'
                                    />
                                    <Tooltip
                                        title={(
                                            <FormattedMessage
                                                id={
                                                    'Apis.Details.Configuration.components.WebSubConfiguration'
                                                    + '.configuration.subVerification.tooltip'
                                                }
                                                defaultMessage={
                                                    'If enabled, APIM will perform verification of intent '
                                                    + 'for the subscription API'
                                                }
                                            />
                                        )}
                                        aria-label='WebSub Configuration helper text'
                                        placement='right-end'
                                        interactive
                                    >
                                        <HelpOutline className={classes.iconSpace} />
                                    </Tooltip>
                                </Typography>
                            )}
                            control={(
                                <Checkbox
                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                    checked={
                                        api.enableSubscriberVerification === undefined ? 
                                            false : api.enableSubscriberVerification
                                    }
                                    onChange={({ target: { checked } }) => configDispatcher({
                                        action: 'enableSubscriberVerification',
                                        value: checked,
                                    })}
                                    color='primary'
                                    inputProps={{
                                        'aria-label': 'WebSub Configuration',
                                    }}
                                    id='websub-verification-checkbox'
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </StyledWrappedExpansionPanel>
    );
}

WebSubConfiguration.propTypes = {
    api: PropTypes.shape({ enableSubscriberVerification: PropTypes.bool }).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};
