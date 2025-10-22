/**
 * Copyright (c)  WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Icon,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormattedMessage, useIntl } from 'react-intl';
import cloneDeep from 'lodash.clonedeep';
import { isRestricted } from 'AppData/AuthManager';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import EndpointListing from 'AppComponents/Apis/Details/Endpoints/EndpointListing';
import LoadBalanceConfig from 'AppComponents/Apis/Details/Endpoints/LoadBalanceConfig';
import Collapse from '@mui/material/Collapse';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { getEndpointTypeProperty } from './endpointUtils';

const PREFIX = 'LoadbalanceFailoverConfig';

const classes = {
    endpointTypeSelect: `${PREFIX}-endpointTypeSelect`,
    configHeaderContainer: `${PREFIX}-configHeaderContainer`,
    generalConfigContent: `${PREFIX}-generalConfigContent`,
    secondaryHeading: `${PREFIX}-secondaryHeading`,
    heading: `${PREFIX}-heading`,
    endpointConfigSection: `${PREFIX}-endpointConfigSection`,
    generalConfigPanel: `${PREFIX}-generalConfigPanel`,
    endpointsTypeSelectWrapper: `${PREFIX}-endpointsTypeSelectWrapper`,
    lbConfigBtn: `${PREFIX}-lbConfigBtn`,
    endpointName: `${PREFIX}-endpointName`,
    wrapper: `${PREFIX}-wrapper`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.endpointTypeSelect}`]: {
        width: '50%',
        marginTop: theme.spacing(1),
    },

    [`& .${classes.configHeaderContainer}`]: {
        display: 'flex',
        justifyContent: 'space-between',
    },

    [`& .${classes.generalConfigContent}`]: {
        boxShadow: 'inset -1px 2px 3px 0px #c3c3c3',
    },

    [`& .${classes.secondaryHeading}`]: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        display: 'flex',
    },

    [`& .${classes.heading}`]: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
        fontWeight: '900',
    },

    [`& .${classes.endpointConfigSection}`]: {
        padding: '10px',
    },

    [`& .${classes.generalConfigPanel}`]: {
        width: '100%',
    },

    [`& .${classes.endpointsTypeSelectWrapper}`]: {
        display: 'flex',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.lbConfigBtn}`]: {
        position: 'relative',
        top: '10px',
    },

    [`& .${classes.endpointName}`]: {
        fontWeight: 600,
    },

    [`& .${classes.wrapper}`]: {
        width: '100%',
    }
}));


/**
 * The component which holds the load balance and failover configuration.
 *
 * @param {any} props The input properties to the component
 * @returns {any} The HTML representation of the component.
 * */
function LoadbalanceFailoverConfig(props) {
    const {
        epConfig,
        endpointsDispatcher,
        toggleAdvanceConfig,
        toggleESConfig,
        globalEpType,
        handleEndpointCategorySelect,
        componentValidator,
    } = props;
    const { api } = useContext(APIContext);
    const [isConfigExpanded, setConfigExpand] = useState(false);
    const [endpointType, setEndpointType] = useState(props);
    const [isLBConfigOpen, setLBConfigOpen] = useState(false);
    const intl = useIntl();

    const endpointTypes = [
        {
            key: 'none',
            value: intl.formatMessage({
                id: 'Apis.Details.Endpoints.LoadbalanceFailoverConfig.types.none',
                defaultMessage: 'None',
            }),
        },
        {
            key: 'failover',
            value: intl.formatMessage({
                id: 'Apis.Details.Endpoints.LoadbalanceFailoverConfig.types.failover',
                defaultMessage: 'Failover',
            }),
        },
        {
            key: 'load_balance',
            value: intl.formatMessage({
                id: 'Apis.Details.Endpoints.LoadbalanceFailoverConfig.types.load.balanced',
                defaultMessage: 'Load Balanced',
            }),
        },
    ];
    
    useEffect(() => {
        const epType = epConfig.endpoint_type;
        if (epType === 'http' || epType === 'address') {
            setEndpointType('none');
        } else {
            setEndpointType(epType);
        }
    }, [props]);

    /**
     * Method to add new loadbalance/ failover endpoint to the existing endpoints.
     *
     * @param {string} category The endpoint category (production/ sandbox)
     * @param {string} type The endpoint type. (load_balance/ failover)
     * @param {string} newURL The url of the new endpoint.
     * */
    const addEndpoint = (category, type, newURL) => {
        const endpointConfigCopy = cloneDeep(epConfig);
        const endpointTemplate = {
            endpoint_type: globalEpType.key,
            template_not_supported: false,
            url: newURL,
        };
        const epConfigProperty = getEndpointTypeProperty(type, category);
        let endpointList = endpointConfigCopy[epConfigProperty];
        /**
         * Check whether we have existing endpoints added.
         * */
        if (endpointList) {
            if (!Array.isArray(endpointList)) {
                endpointList = [endpointList].concat(endpointTemplate);
            } else {
                endpointList = endpointList.concat(endpointTemplate);
            }
        } else {
            endpointList = [endpointTemplate];
        }
        endpointConfigCopy[epConfigProperty] = endpointList;
        endpointsDispatcher({ action: 'add_endpoint', value: endpointConfigCopy });
    };

    /**
     * Method to handle the loadbalance configuration changes.
     *
     * @param {object} lbConfig The modified loadbalance configuration.
     * */
    const handleLBConfigChange = (lbConfig) => {
        endpointsDispatcher({ action: 'set_lb_config', value: { ...epConfig, ...lbConfig } });
        setLBConfigOpen(false);
    };

    const getEndpointTypeHeading = () => {
        switch (endpointType) {
            case 'none':
                return (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.LoadbalanceFailoverConfig.none.heading'
                        defaultMessage='Not Configured'
                    />
                );
            case 'failover':
                return (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.LoadbalanceFailoverConfig.failover.heading'
                        defaultMessage='Failover Endpoints'
                    />
                );
            default:
                return (
                    <FormattedMessage
                        id='Apis.Details.Endpoints.LoadbalanceFailoverConfig.loadbalance.heading'
                        defaultMessage='Load Balanced Endpoints'
                    />
                );
        }
    };

    /**
     * Method to remove the selected endpoint from the endpoints list.
     *
     * @param {number} index The selected endpoint index
     * @param {string} epType The type of the endpoint. (loadbalance/ failover)
     * @param {string} category The endpoint category (production/ sandbox)
     * */
    const removeEndpoint = (index, epType, category) => {
        const tmpEndpointConfig = cloneDeep(epConfig);
        const endpointConfigProperty = getEndpointTypeProperty(epType, category);
        const indexToRemove = epType === 'failover' ? index - 1 : index;
        const tmpEndpoints = tmpEndpointConfig[endpointConfigProperty];
        tmpEndpoints.splice(indexToRemove, 1);
        endpointsDispatcher({
            action: 'remove_endpoint',
            value: { ...epConfig, [endpointConfigProperty]: tmpEndpoints },
        });
    };

    const editEndpoint = () => {};
    const handleEndpointTypeSelect = (event) => {
        setEndpointType(event.target.value);
        handleEndpointCategorySelect(event);
    };

    return (
        <Root>
            <Accordion
                expanded={isConfigExpanded || endpointType === 'load_balance' || endpointType === 'failover'}
                onChange={() => setConfigExpand(!isConfigExpanded)}
                className={classes.generalConfigPanel}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                    className={classes.configHeaderContainer}
                >
                    <Typography className={classes.secondaryHeading}>
                        {getEndpointTypeHeading()}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.generalConfigContent}>
                    {(!epConfig.production_endpoints && !epConfig.sandbox_endpoints)
                        ? (
                            <InlineMessage>
                                <div className={classes.contentWrapper}>
                                    <Typography component='p' className={classes.content}>
                                        <FormattedMessage
                                            id='Apis.Details.Endpoints.LoadbalanceFailoverConfig.no.endpoints.message'
                                            defaultMessage='Add Production/ Sandbox endpoints to configure.'
                                        />
                                    </Typography>
                                </div>
                            </InlineMessage>
                        )
                        : (
                            <Grid container item xs={12}>
                                <Grid xs={12} className={classes.endpointsTypeSelectWrapper}>
                                    <TextField
                                        disabled={isRestricted(['apim:api_create'], api)}
                                        id='certificateEndpoint'
                                        label={(
                                            <FormattedMessage
                                                id='Apis.Details.Endpoints.LoadbalanceFailoverConfig.endpoint.type'
                                                defaultMessage='Endpoint Type'
                                            />
                                        )}
                                        value={endpointType}
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Details.Endpoints.LoadbalanceFailoverConfig.endpoint.placeholder',
                                            defaultMessage: 'Endpoint',
                                        })}
                                        onChange={handleEndpointTypeSelect}
                                        margin='normal'
                                        variant='outlined'
                                        select
                                        className={classes.endpointTypeSelect}
                                    >
                                        {endpointTypes.map((type) => {
                                            return <MenuItem
                                                value={type.key}
                                                id={'config-type-' + type.key}
                                            >
                                                {type.value}
                                            </MenuItem>;
                                        })}
                                    </TextField>
                                    <div className={classes.lpConfigWrapper}>
                                        <IconButton
                                            className={classes.lbConfigBtn}
                                            disabled={epConfig.endpoint_type !== 'load_balance'}
                                            aria-label='Delete'
                                            onClick={() => setLBConfigOpen(true)}
                                            size='large'>
                                            <Icon>
                                                settings
                                            </Icon>
                                        </IconButton>
                                    </div>
                                </Grid>
                                <Grid xs={12} container spacing={2}>
                                    <Collapse className={classes.wrapper} in={endpointType !== 'none'}>
                                        {epConfig.production_endpoints
                                    && (
                                        <Grid xs={12} className={classes.endpointsWrapperLeft}>
                                            <Typography className={classes.endpointName}>
                                                {epConfig.endpoint_type === 'failover'
                                                    ? (
                                                        <FormattedMessage
                                                            id={'Apis.Details.Endpoints.'
                                                            + 'LoadbalanceFailoverConfig.production.'
                                                            + 'failover.endpoint'}
                                                            defaultMessage='Production Failover Endpoints'
                                                        />
                                                    )
                                                    : (
                                                        <FormattedMessage
                                                            id={'Apis.Details.Endpoints.LoadbalanceFailoverConfig.'
                                                    + 'production.loadbalance.endpoint'}
                                                            defaultMessage='Production Loadbalanced Endpoints'
                                                        />
                                                    )}
                                            </Typography>
                                            <EndpointListing
                                                apiEndpoints={epConfig.production_endpoints}
                                                failOvers={epConfig.production_failovers}
                                                epType={epConfig.endpoint_type}
                                                addNewEndpoint={addEndpoint}
                                                removeEndpoint={removeEndpoint}
                                                editEndpoint={editEndpoint}
                                                setAdvancedConfigOpen={toggleAdvanceConfig}
                                                setESConfigOpen={toggleESConfig}
                                                category='production_endpoints'
                                                apiId={api.id}
                                                componentValidator={componentValidator}
                                            />
                                        </Grid>
                                    )}
                                        {epConfig.sandbox_endpoints
                                    && (
                                        <Grid xs={12} className={classes.endpointsWrapperRight}>
                                            <Typography className={classes.endpointName}>
                                                {epConfig.endpoint_type === 'failover'
                                                    ? (
                                                        <FormattedMessage
                                                            id={'Apis.Details.Endpoints.'
                                                            + 'LoadbalanceFailoverConfig.sandbox.'
                                                            + 'failover.endpoint'}
                                                            defaultMessage='Sandbox Failover Endpoints'
                                                        />
                                                    )
                                                    : (
                                                        <FormattedMessage
                                                            id={'Apis.Details.Endpoints.LoadbalanceFailoverConfig.'
                                                    + 'sandbox.loadbalance.endpoint'}
                                                            defaultMessage='Sandbox Loadbalanced Endpoints'
                                                        />
                                                    )}
                                            </Typography>
                                            <EndpointListing
                                                apiEndpoints={epConfig.sandbox_endpoints}
                                                failOvers={epConfig.sandbox_failovers}
                                                epType={epConfig.endpoint_type}
                                                addNewEndpoint={addEndpoint}
                                                removeEndpoint={removeEndpoint}
                                                editEndpoint={editEndpoint}
                                                setAdvancedConfigOpen={toggleAdvanceConfig}
                                                setESConfigOpen={toggleESConfig}
                                                category='sandbox_endpoints'
                                                apiId={api.id}
                                                componentValidator={componentValidator}
                                            />
                                        </Grid>
                                    )}
                                    </Collapse>
                                </Grid>
                            </Grid>
                        )}
                </AccordionDetails>
            </Accordion>
            <Dialog open={isLBConfigOpen}>
                <DialogTitle>
                    <Typography className={classes.configDialogHeader}>
                        <FormattedMessage
                            id='Apis.Details.Endpoints.LoadbalanceFailoverConfig.load.balance.configuration.title'
                            defaultMessage='Load Balance Configurations'
                        />
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <LoadBalanceConfig
                        handleLBConfigChange={handleLBConfigChange}
                        closeLBConfigDialog={() => setLBConfigOpen(false)}
                        algoCombo={epConfig.algoCombo}
                        algoClassName={epConfig.algoClassName}
                        sessionTimeOut={epConfig.sessionTimeOut}
                        failOver={epConfig.failOver}
                        sessionManagement={epConfig.sessionManagement}
                    />
                </DialogContent>
            </Dialog>
        </Root>
    );
}

LoadbalanceFailoverConfig.propTypes = {
    epConfig: PropTypes.shape({}).isRequired,
    endpointSecurityInfo: PropTypes.shape({}).isRequired,
    endpointType: PropTypes.shape({}).isRequired,
    classes: PropTypes.shape({}).isRequired,
    endpointsDispatcher: PropTypes.func.isRequired,
    toggleAdvanceConfig: PropTypes.func.isRequired,
    toggleESConfig: PropTypes.func.isRequired,
    handleEndpointCategorySelect: PropTypes.func.isRequired,
    globalEpType: PropTypes.shape({}).isRequired,
};

export default LoadbalanceFailoverConfig;
