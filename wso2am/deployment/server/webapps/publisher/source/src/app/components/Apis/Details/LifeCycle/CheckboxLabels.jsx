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
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import LaunchIcon from '@mui/icons-material/Launch';

import { green, yellow } from '@mui/material/colors';

const PREFIX = 'CheckboxLabels';

const classes = {
    stateButton: `${PREFIX}-stateButton`,
    paperCenter: `${PREFIX}-paperCenter`,
    iconTrue: `${PREFIX}-iconTrue`,
    iconFalse: `${PREFIX}-iconFalse`,
    iconWarn: `${PREFIX}-iconWarn`,
    grid: `${PREFIX}-grid`,
    labelsGrid: `${PREFIX}-labelsGrid`
};

const StyledPaper = styled(Paper)((
    {
        theme
    }
) => ({
    [`& .${classes.stateButton}`]: {
        marginRight: theme.spacing(),
    },

    [`&.${classes.paperCenter}`]: {
        padding: theme.spacing(2),
        display: 'block',
        alignItems: 'left',
        justifyContent: 'center',
    },

    [`& .${classes.iconTrue}`]: {
        color: green[500],
        marginRight: theme.spacing(1),
        display: 'block',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    [`& .${classes.iconFalse}`]: {
        color: theme.palette.grey[500],
        marginRight: theme.spacing(1),
        display: 'block',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    [`& .${classes.iconWarn}`]: {
        color: yellow[700],
        marginRight: theme.spacing(1),
        display: 'block',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    [`& .${classes.grid}`]: {
        marginTop: theme.spacing(2),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
    },

    [`& .${classes.labelsGrid}`]: {
        fontWeight: 600,
        marginTop: theme.spacing(3),
    }
}));

/**
 * This component renders the requirements list
 * @param {*} props
 */
export default function CheckboxLabels(props) {

    const {
        api, isMutualSSLEnabled, isCertAvailable, isAppLayerSecurityMandatory, isBusinessPlanAvailable, isAPIProduct,
        isMandatoryPropertiesAvailable, isMandatoryPropertiesConfigured
    } = props;
    const isEndpointAvailable = !isAPIProduct
        ? api.endpointConfig !== null
        : false;
    const lcState = isAPIProduct ? api.state : api.lifeCycleStatus;

    return (
        <StyledPaper className={classes.paperCenter}>
            <Grid xs={12}>
                <Typography variant='h6' component='h4'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.Configuration.requirements'
                        defaultMessage='Requirements'
                    />
                </Typography>
                <Typography variant='caption'>
                    <FormattedMessage
                        id='Apis.Details.Configuration.Configuration.requirements.state.transition'
                        defaultMessage='Requirements for next state transition'
                    />
                </Typography>
            </Grid>
            {(lcState === 'CREATED' || lcState === 'PROTOTYPED') && (
                <>
                    <Grid xs={12} className={classes.labelsGrid}>
                        <Typography variant='subtitle2' component='h5'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.publisher'
                                defaultMessage='Publish'
                            />
                        </Typography>
                    </Grid>
                    <Grid xs={12}>
                        {api.type !== 'WEBSUB' && !isAPIProduct && (
                            <Grid xs={12} className={classes.grid}>
                                {isEndpointAvailable ? (
                                    <CheckIcon className={classes.iconTrue} />
                                ) : (
                                    <CloseIcon className={classes.iconFalse} />
                                )}
                                <Typography>
                                    <FormattedMessage
                                        data-testid='endpoint-req'
                                        id='Apis.Details.LifeCycle.CheckboxLabels.endpoints.provided'
                                        defaultMessage='Endpoint provided'
                                    />
                                </Typography>
                                <Link to={'/apis/' + api.id + '/endpoints'} aria-label='Endpoint provided'>
                                    <LaunchIcon style={{ marginLeft: '2px' }} color='primary' fontSize='small' />
                                </Link>
                            </Grid>
                        )}
                        <>
                            {isAppLayerSecurityMandatory && (
                                <Grid xs={12} className={classes.grid}>
                                    {isBusinessPlanAvailable ? (
                                        <CheckIcon className={classes.iconTrue} />
                                    ) : (
                                        <CloseIcon className={classes.iconFalse} />
                                    )}
                                    <Typography data-testid='business-plan-req'>
                                        <FormattedMessage
                                            id='Apis.Details.LifeCycle.CheckboxLabels.business.plans.selected'
                                            defaultMessage='Business Plan(s) selected'
                                        />
                                    </Typography>
                                    <Link to={'/apis/' + api.id + '/subscriptions'} aria-label='Business Plan(s)'>
                                        <LaunchIcon style={{ marginLeft: '2px' }} color='primary' fontSize='small' />
                                    </Link>
                                </Grid>
                            )}
                            {isMutualSSLEnabled && (
                                <Grid xs={12} className={classes.grid}>
                                    {isCertAvailable ? (
                                        <CheckIcon className={classes.iconTrue} />
                                    ) : (
                                        <CloseIcon className={classes.iconFalse} />
                                    )}
                                    <Typography>
                                        <FormattedMessage
                                            id='Apis.Details.LifeCycle.CheckboxLabels.cert.provided'
                                            defaultMessage='Certificate provided'
                                        />
                                    </Typography>
                                    <Link
                                        to={'/apis/' + api.id + '/runtime-configuration'}
                                        aria-label='Certificate provided'
                                    >
                                        <LaunchIcon style={{ marginLeft: '2px' }} color='primary' fontSize='small' />
                                    </Link>
                                </Grid>
                            ) }
                            {isMandatoryPropertiesConfigured && (
                                <Grid xs={12} className={classes.grid}>
                                    {isMandatoryPropertiesAvailable ? (
                                        <CheckIcon className={classes.iconTrue} />
                                    ) : (
                                        <CloseIcon className={classes.iconFalse} />
                                    )}
                                    <Typography>
                                        <FormattedMessage
                                            id='Apis.Details.LifeCycle.CheckboxLabels.mandatory.properties.provided'
                                            defaultMessage='Mandatory Properties provided'
                                        />
                                    </Typography>
                                    <Link to={'/apis/' + api.id + '/properties'} aria-label='Properties'>
                                        <LaunchIcon style={{ marginLeft: '2px' }} color='primary' fontSize='small' />
                                    </Link>
                                </Grid>
                            )}
                        </>
                    </Grid>
                </>
            )}
        </StyledPaper>
    );
}

CheckboxLabels.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};
