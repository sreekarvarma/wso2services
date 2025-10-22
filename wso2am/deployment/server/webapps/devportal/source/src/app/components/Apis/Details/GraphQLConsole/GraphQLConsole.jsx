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

import React, { useState, useContext, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import AuthManager from 'AppData/AuthManager';
import Icon from '@mui/material/Icon';
import Box from '@mui/material/Box';
import GraphQLUI from './GraphQLUI';
import TryOutController from '../../../Shared/ApiTryOut/TryOutController';
import { ApiContext } from '../ApiContext';
import Api from '../../../../data/api';
import Progress from '../../../Shared/Progress';
import AdditionalHeaders from './AdditionalHeaders';

const PREFIX = 'GraphQLConsole';

const classes = {
    buttonIcon: `${PREFIX}-buttonIcon`,
    paper: `${PREFIX}-paper`,
    grid: `${PREFIX}-grid`,
    userNotificationPaper: `${PREFIX}-userNotificationPaper`,
    titleSub: `${PREFIX}-titleSub`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.buttonIcon}`]: {
        marginRight: 10,
    },

    [`& .${classes.paper}`]: {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },

    [`& .${classes.grid}`]: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
        paddingRight: theme.spacing(2),
        justifyContent: 'center',
    },

    [`& .${classes.userNotificationPaper}`]: {
        padding: theme.spacing(2),
    },

    [`& .${classes.titleSub}`]: {
        marginLeft: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}));

export default function GraphQLConsole() {
    const { api } = useContext(ApiContext);
    const environmentObject = api.endpointURLs;
    const [URLs, setURLs] = useState(environmentObject.length > 0 ? environmentObject[0].URLs : null);
    const [securitySchemeType, setSecurityScheme] = useState('OAUTH');
    const [notFound, setNotFound] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedEnvironment, setSelectedEnvironment] = useState();
    const [environments, setEnvironments] = useState();
    const [scopes, setScopes] = useState([]);
    const [productionAccessToken, setProductionAccessToken] = useState();
    const [sandboxAccessToken, setSandboxAccessToken] = useState();
    const [selectedKeyType, setSelectedKey] = useState('PRODUCTION');
    const [sandboxApiKey, setSandboxApiKey] = useState('');
    const [productionApiKey, setProductionApiKey] = useState('');
    const [advAuthHeader, setAdvAuthHeader] = useState('Authorization');
    const [advAuthHeaderValue, setAdvAuthHeaderValue] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('PRODUCTION');
    const [keys, setKeys] = useState([]);
    const [additionalHeaders, setAdditionalHeaders] = useState([]);
    const user = AuthManager.getUser();
    const isAdvertised = api.advertiseInfo && api.advertiseInfo.advertised;

    useEffect(() => {
        const apiID = api.id;
        const apiClient = new Api();
        const promiseAPI = apiClient.getAPIById(apiID);

        promiseAPI
            .then((apiResponse) => {
                const apiData = apiResponse.obj;
                if (apiData.endpointURLs) {
                    const environment = apiData.endpointURLs.map((endpoint) => {
                        return { name: endpoint.environmentName, displayName: endpoint.environmentDisplayName };
                    });
                    setEnvironments(environment);
                }
                if (apiData.scopes) {
                    const scopeList = apiData.scopes.map((scope) => { return scope.name; });
                    setScopes(scopeList);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                const { status } = error;
                if (status === 404) {
                    setNotFound(true);
                }
            });
    }, []);

    /**
     * Load the access token for given key type
     */
    function updateAccessToken() {
        let accessToken;
        if (keys.get(selectedKeyType)) {
            ({ accessToken } = keys.get(selectedKeyType).token);
        }
        if (selectedKeyType === 'PRODUCTION') {
            setProductionAccessToken(accessToken);
        } else {
            setSandboxAccessToken(accessToken);
        }
    }

    /**
     * Generate the URLs object for third party APIs
     * @param url endpoint URL
     * @returns {{wss: null, http: null, https: null, ws: null}}
     */
    function generateUrls(url) {
        const urlJson = {
            http: null,
            https: null,
            ws: null,
            wss: null,
        };
        const [protocol] = url.split('://');
        if (protocol === 'http' || protocol === 'https' || protocol === 'ws' || protocol === 'wss') {
            urlJson[protocol] = url;
        }
        return urlJson;
    }

    /**
     * get the URLs object for GraphQL APIs
     * @returns {*}
     */
    function getURLs() {
        if (api.advertiseInfo && api.advertiseInfo.advertised) {
            if (selectedEndpoint === 'PRODUCTION') {
                return generateUrls(api.advertiseInfo.apiExternalProductionEndpoint);
            } else if (selectedEndpoint === 'SANDBOX') {
                return generateUrls(api.advertiseInfo.apiExternalSandboxEndpoint);
            }
        }
        return URLs;
    }

    /**
     * set Password
     * @param {*} selectedKey
     * @param {*} isUpdateToken
     */
    function setSelectedKeyType(selectedKey, isUpdateToken) {
        if (isUpdateToken && !isAdvertised) {
            setSelectedKey(selectedKey, updateAccessToken);
        } else {
            setSelectedKey(selectedKey);
        }
    }

    function accessTokenProvider() {
        if (isAdvertised) {
            return advAuthHeaderValue;
        }
        if (securitySchemeType === 'BASIC') {
            const credentials = username + ':' + password;
            return btoa(credentials);
        }
        if (securitySchemeType === 'API-KEY') {
            if (selectedKeyType === 'PRODUCTION') {
                return productionApiKey;
            } else {
                return sandboxApiKey;
            }
        } else if (selectedKeyType === 'PRODUCTION') {
            return productionAccessToken;
        } else {
            return sandboxAccessToken;
        }
    }

    if (api == null) {
        return <Progress />;
    }
    if (notFound) {
        return 'API Not found !';
    }
    let isApiKeyEnabled = false;

    let authorizationHeader = api.authorizationHeader ? api.authorizationHeader : 'Authorization';

    if (api && api.securityScheme) {
        isApiKeyEnabled = api.securityScheme.includes('api_key');
        if (isApiKeyEnabled && securitySchemeType === 'API-KEY') {
            authorizationHeader = api.apiKeyHeader ? api.apiKeyHeader : 'ApiKey';
        }
    }

    if (isAdvertised) {
        authorizationHeader = advAuthHeader;
    }

    return (
        <Root>
            <Typography variant='h4' className={classes.titleSub}>
                <FormattedMessage id='Apis.Details.GraphQLConsole.GraphQLConsole.title' defaultMessage='Try Out' />
            </Typography>
            <Paper className={classes.paper}>
                <Grid container className={classes.grid}>
                    {!user && !isAdvertised && (
                        <Grid item md={6}>
                            <Paper className={classes.userNotificationPaper}>
                                <Typography variant='h5' component='h3'>
                                    <Icon>info</Icon>
                                    {' '}
                                    <FormattedMessage id='notice' defaultMessage='Notice' />
                                </Typography>
                                <Typography component='p'>
                                    <FormattedMessage
                                        id='api.console.require.access.token'
                                        defaultMessage={'You need an access token to try the API. Please log '
                                            + 'in and subscribe to the API to generate an access token. If you already '
                                            + 'have an access token, please provide it below.'}
                                    />
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
                <Grid container className={classes.grid}>
                    <TryOutController
                        setSecurityScheme={setSecurityScheme}
                        securitySchemeType={securitySchemeType}
                        setSelectedEnvironment={setSelectedEnvironment}
                        selectedEnvironment={selectedEnvironment}
                        productionAccessToken={productionAccessToken}
                        setProductionAccessToken={setProductionAccessToken}
                        sandboxAccessToken={sandboxAccessToken}
                        setSandboxAccessToken={setSandboxAccessToken}
                        environments={environments}
                        scopes={scopes}
                        setUsername={setUsername}
                        setPassword={setPassword}
                        username={username}
                        password={password}
                        setSelectedKeyType={setSelectedKeyType}
                        selectedKeyType={selectedKeyType}
                        setKeys={setKeys}
                        setURLs={setURLs}
                        setProductionApiKey={setProductionApiKey}
                        setSandboxApiKey={setSandboxApiKey}
                        productionApiKey={productionApiKey}
                        sandboxApiKey={sandboxApiKey}
                        environmentObject={environmentObject}
                        setAdvAuthHeader={setAdvAuthHeader}
                        setAdvAuthHeaderValue={setAdvAuthHeaderValue}
                        advAuthHeader={advAuthHeader}
                        advAuthHeaderValue={advAuthHeaderValue}
                        setSelectedEndpoint={setSelectedEndpoint}
                        selectedEndpoint={selectedEndpoint}
                        api={api}
                        URLs={URLs}
                    />
                </Grid>
                <Box display='flex' justifyContent='center'>
                    <Box
                        width='50%'
                        display='flex'
                        flexDirection='column'
                    >
                        <Box ml={-5} display='flex'>
                            <Typography variant='h5' component='h3' color='textPrimary'>
                                <FormattedMessage
                                    id='api.console.gql.additional.headers'
                                    defaultMessage='Additional Headers'
                                />
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Grid container className={classes.grid}>
                    <Grid item md={6}>
                        <AdditionalHeaders
                            setAdditionalHeaders={setAdditionalHeaders}
                            additionalHeaders={additionalHeaders}
                        />
                    </Grid>
                </Grid>
            </Paper>
            <Paper className={classes.paper}>
                <GraphQLUI
                    authorizationHeader={authorizationHeader}
                    URLs={getURLs()}
                    securitySchemeType={securitySchemeType}
                    accessTokenProvider={accessTokenProvider}
                    additionalHeaders={additionalHeaders}
                />
            </Paper>
        </Root>
    );
}

GraphQLConsole.propTypes = {
    classes: PropTypes.shape({
        paper: PropTypes.string.isRequired,
        titleSub: PropTypes.string.isRequired,
        root: PropTypes.string.isRequired,
    }).isRequired,
};
