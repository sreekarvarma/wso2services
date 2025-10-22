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

import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormHelperText from '@mui/material/FormHelperText';
import { FormattedMessage, injectIntl } from 'react-intl';
import Certificates from 'AppComponents/Apis/Details/Endpoints/GeneralConfiguration/Certificates';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import WrappedExpansionPanel from 'AppComponents/Shared/WrappedExpansionPanel';
import Transports from 'AppComponents/Apis/Details/Configuration/components/Transports.jsx';

import {
    API_SECURITY_MUTUAL_SSL,
    API_SECURITY_MUTUAL_SSL_MANDATORY,
    API_SECURITY_MUTUAL_SSL_OPTIONAL,
    DEFAULT_API_SECURITY_OAUTH2,
    API_SECURITY_BASIC_AUTH,
    API_SECURITY_API_KEY,
    API_SECURITY_KEY_TYPE_PRODUCTION,
    API_SECURITY_KEY_TYPE_SANDBOX
} from './apiSecurityConstants';

const PREFIX = 'TransportLevel';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    bottomSpace: `${PREFIX}-bottomSpace`,
    subHeading: `${PREFIX}-subHeading`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.bottomSpace}`]: {
        marginBottom: theme.spacing(4),
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
 *
 * @export
 * @param {*} props
 * @returns
 */
function TransportLevel(props) {
    const {
        haveMultiLevelSecurity, securityScheme, configDispatcher, intl, id, api, componentValidator,
    } = props;
    const isMutualSSLEnabled = securityScheme.includes(API_SECURITY_MUTUAL_SSL);
    const [apiFromContext] = useAPI();
    const [productionClientCertificates, setProductionClientCertificates] = useState([]);
    const [sandboxClientCertificates, setSandboxClientCertificates] = useState([]);


    /**
     * Method to upload the certificate content by calling the rest api.
     *
     * @param {string} certificate The certificate needs to be associated with the API
     * @param {string} keyType The key type of the certificate. (whether production or sandbox)
     * @param {string} policy The tier to be used for the certificate.
     * @param {string} alias The alias of the certificate to be deleted.
     *
     * */
    const saveClientCertificate = (certificate, keyType, policy, alias) => {
        return API.addClientCertificate(id, certificate, keyType, policy, alias).then((resp) => {
            if (resp.status === 201) {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.Configuration.components.APISecurity.TranportLevel.certificate.add.success',
                    defaultMessage: 'Certificate added successfully',
                }));
                if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                    const tmpSandboxCertificates = [...sandboxClientCertificates];
                    tmpSandboxCertificates.push({
                        apiId: resp.obj.apiId,
                        alias: resp.obj.alias,
                        tier: resp.obj.tier,
                    });
                    setSandboxClientCertificates(tmpSandboxCertificates);

                } else {
                    const tmpProductionCertificates = [...productionClientCertificates];
                    tmpProductionCertificates.push({
                        apiId: resp.obj.apiId,
                        alias: resp.obj.alias,
                        tier: resp.obj.tier,
                    });
                    setProductionClientCertificates(tmpProductionCertificates);
                }
            }
        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Configuration.components.APISecurity.TranportLevel.certificate.alias.error',
                    defaultMessage: 'Something went wrong while adding the API certificate',
                }));
            }
        });
    };

    /**
     * Method to delete the selected certificate.
     *
     * @param {string} keyType The key type of the certificate to be deleted.
     * @param {string} alias The alias of the certificate to be deleted.
     * */
    const deleteClientCertificate = (keyType, alias) => {
        return API.deleteClientCertificate(keyType, alias, id).then((resp) => {
            if (keyType === API_SECURITY_KEY_TYPE_SANDBOX) {
                setSandboxClientCertificates(() => {
                    if (resp.status === 200) {
                        return sandboxClientCertificates.filter((cert) => {
                            return cert.alias !== alias;
                        });
                    } else {
                        return -1;
                    }
                });
            } else {
                setProductionClientCertificates(() => {
                    if (resp.status === 200) {
                        return productionClientCertificates.filter((cert) => {
                            return cert.alias !== alias;
                        });
                    } else {
                        return -1;
                    }
                });
            }
            Alert.info(intl.formatMessage({
                id: 'Apis.Details.Configuration.components.APISecurity.TranportLevel.certificate.delete.success',
                defaultMessage: 'Certificate Deleted Successfully',
            }));
        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.Configuration.components.APISecurity.TranportLevel.certificate.delete.error',
                    defaultMessage: 'Error while deleting certificate',
                }));
            }
        });
    };

    const handleMutualSSLChange = (event) => {
        const { checked } = event.target;
        if (checked) {
            configDispatcher({
                action: 'transport',
                event: { checked: false, value: 'http' },
            });
        }
        configDispatcher({
            action: 'securityScheme',
            event: { checked, value: API_SECURITY_MUTUAL_SSL },
        });
    };

    // Get the client certificates from backend.
    useEffect(() => {
        API.getAllClientCertificatesOfGivenKeyType(API_SECURITY_KEY_TYPE_PRODUCTION, id).then((resp) => {
            const { certificates: productionCertificates } = resp.obj;
            setProductionClientCertificates(productionCertificates);
        }).catch((err) => {
            console.error(err);
            setProductionClientCertificates([]);
        });

        API.getAllClientCertificatesOfGivenKeyType(API_SECURITY_KEY_TYPE_SANDBOX, id).then((resp) => {
            const { certificates: sandboxCertificates } = resp.obj;
            setSandboxClientCertificates(sandboxCertificates);
        }).catch((err) => {
            console.error(err);
            setSandboxClientCertificates([]);
        });
    }, []);

    let mandatoryValue = API_SECURITY_MUTUAL_SSL_OPTIONAL;
    // If not mutual ssl security is selected, no mandatory values should be pre-selected
    if (!isMutualSSLEnabled) {
        mandatoryValue = null;
    } else if (
        !(securityScheme.includes(DEFAULT_API_SECURITY_OAUTH2) || securityScheme.includes(API_SECURITY_BASIC_AUTH)
            || securityScheme.includes(API_SECURITY_API_KEY))
    ) {
        mandatoryValue = API_SECURITY_MUTUAL_SSL_MANDATORY;
    } else if (securityScheme.includes(API_SECURITY_MUTUAL_SSL_MANDATORY)) {
        mandatoryValue = API_SECURITY_MUTUAL_SSL_MANDATORY;
    } else {
        mandatoryValue = API_SECURITY_MUTUAL_SSL_OPTIONAL;
    }

    useEffect(() => {
        if (mandatoryValue !== null) {
            const name = API_SECURITY_MUTUAL_SSL_MANDATORY.slice(0);
            const value = mandatoryValue.slice(0);
            configDispatcher({
                action: 'securityScheme',
                event: { name, value },
            });
        }
    }, []);

    const [mandatoryValueRef, setMandatoryValueRef] = useState(mandatoryValue);

    useEffect(() => {
        setMandatoryValueRef(mandatoryValue);
    });

    return (
        (<Root>
            <Grid item xs={12}>
                <WrappedExpansionPanel className={classes.expansionPanel} id='transportLevel'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.subHeading} variant='h6' component='h4'>
                            <FormattedMessage
                                id={'Apis.Details.Configuration.Components.APISecurity.Components.'
                                    + 'TransportLevel.transport.level.security'}
                                defaultMessage='Transport Level Security'
                            />
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.expansionPanelDetails}>
                        <Transports api={api} configDispatcher={configDispatcher} 
                            securityScheme={securityScheme} componentValidator={componentValidator} />
                        {componentValidator.includes('transportsMutualSSL') && 
                            <FormControlLabel
                                control={(
                                    <Checkbox
                                        disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                        checked={isMutualSSLEnabled}
                                        onChange={handleMutualSSLChange}
                                        color='primary'
                                        id='mutual-ssl-checkbox'
                                    />
                                )}
                                label='Mutual SSL'
                            />
                        }
                        {(isMutualSSLEnabled && componentValidator.includes('transportsMutualSSL')) && (
                            <FormControl component='fieldset'>
                                <RadioGroup
                                    aria-label='HTTP security SSL mandatory selection'
                                    name={API_SECURITY_MUTUAL_SSL_MANDATORY}
                                    value={mandatoryValueRef}
                                    onChange={({ target: { name, value } }) => {
                                        setMandatoryValueRef(value);
                                        configDispatcher({
                                            action: 'securityScheme',
                                            event: { name, value },
                                        });
                                    }}
                                    row
                                >
                                    <FormControlLabel
                                        value={API_SECURITY_MUTUAL_SSL_MANDATORY}
                                        control={(
                                            <Radio
                                                disabled={!haveMultiLevelSecurity
                                                || isRestricted(['apim:api_create'], apiFromContext)}
                                                color='primary'
                                            />
                                        )}
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                                + 'TransportLevel.transport.level.security.mutual.ssl.mandatory',
                                            defaultMessage: 'Mandatory',
                                        })}
                                        labelPlacement='end'
                                    />
                                    <FormControlLabel
                                        value={API_SECURITY_MUTUAL_SSL_OPTIONAL}
                                        control={(
                                            <Radio
                                                disabled={!haveMultiLevelSecurity
                                                || isRestricted(['apim:api_create'], apiFromContext)}
                                                color='primary'
                                            />
                                        )}
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Configuration.Components.APISecurity.Components.'
                                                + 'TransportLevel.transport.level.security.mutual.ssl.optional',
                                            defaultMessage: 'Optional',
                                        })}
                                        labelPlacement='end'
                                    />
                                </RadioGroup>
                                <FormHelperText>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.APISecurity.http.mandatory'
                                        defaultMessage='Choose whether Transport level security is mandatory or
                                        optional'
                                    />
                                </FormHelperText>
                            </FormControl>
                        )}
                        {(isMutualSSLEnabled && (!api.advertiseInfo || !api.advertiseInfo.advertised)) &&
                            componentValidator.includes('transportsMutualSSL') && (
                            // TODO:
                            // This is half baked!!!
                            // Refactor the Certificate component to share its capabilities in here and
                            // endpoints page ~tmkb
                            <Certificates
                                isMutualSSLEnabled={isMutualSSLEnabled}
                                productionCertificates={productionClientCertificates}
                                sandboxCertificates={sandboxClientCertificates}
                                uploadCertificate={saveClientCertificate}
                                deleteCertificate={deleteClientCertificate}
                                apiId={id}
                                api={apiFromContext}
                            />
                        )}
                    </AccordionDetails>
                </WrappedExpansionPanel>
            </Grid>
        </Root>)
    );
}

TransportLevel.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
    haveMultiLevelSecurity: PropTypes.bool.isRequired,
    securityScheme: PropTypes.arrayOf(PropTypes.string).isRequired,
    intl: PropTypes.shape({}).isRequired,
    id: PropTypes.string.isRequired,
    api: PropTypes.shape({}).isRequired,
};

export default injectIntl((TransportLevel));
