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
import React, { useReducer, useState, useEffect } from 'react';
import API from 'AppData/api';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Wsdl from 'AppData/Wsdl';
import Alert from 'AppComponents/Shared/Alert';
import { Link as MUILink } from '@mui/material';
import { Alert as MUIAlert, AlertTitle } from '@mui/lab';
import CircularProgress from '@mui/material/CircularProgress';
import DefaultAPIForm from 'AppComponents/Apis/Create/Components/DefaultAPIForm';
import APICreateBase from 'AppComponents/Apis/Create/Components/APICreateBase';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';

import ProvideWSDL from './Steps/ProvideWSDL';

/**
 * Handle API creation from WSDL.
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function ApiCreateWSDL(props) {
    const intl = useIntl();
    const [wizardStep, setWizardStep] = useState(0);
    const { history, multiGateway } = props;
    const [policies, setPolicies] = useState([]);
    const { data: settings } = usePublisherSettings();

    useEffect(() => {
        API.policies('subscription').then((response) => {
            const allPolicies = response.body.list;
            if (allPolicies.length === 0) {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.WSDL.ApiCreateWSDL.error.policies.not.available',
                    defaultMessage: 'Throttling policies not available. Contact your administrator',
                }));
            } else if (allPolicies.filter((p) => p.name === 'Unlimited').length > 0) {
                setPolicies(['Unlimited']);
            } else {
                setPolicies([allPolicies[0].name]);
            }
        });
    }, []);
    /**
     *
     * Reduce the events triggered from API input fields to current state
     */
    function apiInputsReducer(currentState, inputAction) {
        const { action, value } = inputAction;
        switch (action) {
            case 'type':
            case 'inputValue':
            case 'name':
            case 'version':
            case 'endpoint':
            case 'context':
            case 'isFormValid':
                return { ...currentState, [action]: value };
            case 'inputType':
                return { ...currentState, [action]: value, inputValue: value === 'url' ? '' : null };
            default:
                return currentState;
        }
    }

    const [apiInputs, inputsDispatcher] = useReducer(apiInputsReducer, {
        type: 'SOAP',
        inputType: 'url',
        inputValue: '',
        formValidity: false,
        mode: 'create',
        gatewayType: multiGateway && (multiGateway.filter((gw) => gw.value === 'wso2/synapse').length > 0 ?
            'wso2/synapse' : multiGateway[0]?.value),
    });

    /**
     *
     *
     * @param {*} event
     */
    function handleOnChange(event) {
        const { name: action, value } = event.target;
        inputsDispatcher({ action, value });
    }

    /**
     *
     * Set the validity of the API Inputs form
     * @param {*} isValidForm
     * @param {*} validationState
     */
    function handleOnValidate(isFormValid) {
        inputsDispatcher({
            action: 'isFormValid',
            value: isFormValid,
        });
    }

    const [isCreating, setCreating] = useState();
    /**
     *
     *
     * @param {*} params
     */
    function createAPI() {
        setCreating(true);
        const {
            name, version, context, endpoint, type,
        } = apiInputs;
        const additionalProperties = {
            name,
            version,
            context,
            policies,
        };
        if (endpoint) {
            additionalProperties.endpointConfig = {
                endpoint_type: type === 'SOAPTOREST' ? 'address' : 'http',
                sandbox_endpoints: {
                    type: type === 'SOAPTOREST' ? 'address' : undefined,
                    url: endpoint,
                },
                production_endpoints: {
                    type: type === 'SOAPTOREST' ? 'address' : undefined,
                    url: endpoint,
                },
            };
        }
        let promisedWSDLImport;
        if (apiInputs.inputType === 'url') {
            promisedWSDLImport = Wsdl.importByUrl(apiInputs.inputValue, additionalProperties, apiInputs.type);
        } else {
            promisedWSDLImport = Wsdl.importByFileOrArchive(apiInputs.inputValue, additionalProperties, apiInputs.type);
        }
        promisedWSDLImport
            .then((api) => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Create.WSDL.ApiCreateWSDL.create.success',
                    defaultMessage: 'API created successfully',
                }));
                history.push(`/apis/${api.id}/overview`);
            })
            .catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Create.WSDL.ApiCreateWSDL.create.error',
                        defaultMessage: 'Something went wrong while adding the API',
                    }));
                }
                console.error(error);
            })
            .finally(() => setCreating(false));
    }

    return (
        <APICreateBase
            title={(
                <>
                    {wizardStep === 1 && apiInputs.type === "SOAPTOREST" && (
                        <Box mb={2}>
                            <MUIAlert severity='warning'>
                                <AlertTitle>
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.ApiCreateWSDL.deprecated.msg'
                                        defaultMessage='APIM supports only a limited set of capabilities with
                                        this feature. If you want to process complex WSDL/XML schema,
                                        please refer to the following documentation.'
                                    />
                                </AlertTitle>
                                <MUILink
                                    // eslint-disable-next-line
                                    href={`https://mi.docs.wso2.com/en/latest/develop/creating-artifacts/creating-an-api/`}
                                    target='_blank'>
                                    WSO2 Integration Studio Documentation
                                </MUILink>
                            </MUIAlert>
                        </Box>
                    )}
                    <Typography variant='h5'>
                        <FormattedMessage
                            id='Apis.Create.WSDL.ApiCreateWSDL.heading'
                            defaultMessage='Expose a SOAP Service as a REST API'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Create.WSDL.ApiCreateWSDL.sub.heading'
                            defaultMessage={
                                'Expose an existing SOAP service as a REST API by importing the WSDL of the '
                                + 'SOAP service.'
                            }
                        />
                    </Typography>
                </>
            )}
        >
            <Box sx={{ mb: 2 }}>
                <Stepper alternativeLabel activeStep={wizardStep}>
                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.WSDL.ApiCreateWSDL.step.label.provide.wsdl'
                                defaultMessage='Provide WSDL'
                            />
                        </StepLabel>
                    </Step>

                    <Step>
                        <StepLabel>
                            <FormattedMessage
                                id='Apis.Create.WSDL.ApiCreateWSDL.step.label.create.api'
                                defaultMessage='Create API'
                            />
                        </StepLabel>
                    </Step>
                </Stepper>
            </Box>

            <Grid container spacing={2}>
                <Grid item md={12}>
                    {wizardStep === 0 && (
                        <ProvideWSDL
                            onValidate={handleOnValidate}
                            apiInputs={apiInputs}
                            inputsDispatcher={inputsDispatcher}
                        />
                    )}
                    {wizardStep === 1 && (
                        <DefaultAPIForm
                            onValidate={handleOnValidate}
                            onChange={handleOnChange}
                            api={apiInputs}
                            isAPIProduct={false}
                            multiGateway={multiGateway}
                            settings={settings}
                        />
                    )}
                </Grid>
                <Grid item md={12}>
                    <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Link to='/apis/'>
                                    <Button>
                                        <FormattedMessage
                                            id='Apis.Create.OpenAPI.ApiCreateOpenAPI.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </Link>
                            )}
                            {wizardStep === 1 && (
                                <Button onClick={
                                    () => setWizardStep((step) => step - 1)
                                }
                                >
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.ApiCreateWSDL.step.label.create.api.back.btn'
                                        defaultMessage='Back'
                                    />
                                </Button>
                            )}
                        </Grid>
                        <Grid item>
                            {wizardStep === 0 && (
                                <Button
                                    onClick={() => setWizardStep((step) => step + 1)}
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid}
                                >
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.ApiCreateWSDL.step.label.create.api.next.btn'
                                        defaultMessage='Next'
                                    />
                                </Button>
                            )}
                            {wizardStep === 1 && (
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={!apiInputs.isFormValid || isCreating}
                                    onClick={createAPI}
                                >
                                    <FormattedMessage
                                        id='Apis.Create.WSDL.ApiCreateWSDL.step.label.create.api.create.btn'
                                        defaultMessage='Create'
                                    />
                                    {' '}
                                    {isCreating && <CircularProgress size={24} />}
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </APICreateBase>
    );
}

ApiCreateWSDL.propTypes = {
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};
