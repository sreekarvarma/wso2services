/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import 'swagger-ui-react/swagger-ui.css';

import { styled } from '@mui/material/styles';

import React, {
    Suspense,
    lazy,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';

import Alert from 'AppComponents/Shared/MuiAlert';
import Api from 'AppData/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CONSTS from 'AppData/Constants';
import CircularProgress from '@mui/material/CircularProgress';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Utils from 'AppData/Utils';
import cloneDeep from 'lodash.clonedeep';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { isRestricted } from 'AppData/AuthManager';
import AdvertiseDetailsPanel from "AppComponents/Apis/Details/TryOut/AdvertiseDetailsPanel";

const PREFIX = 'TryOutConsole';

const classes = {
    centerItems: `${PREFIX}-centerItems`,
    tryoutHeading: `${PREFIX}-tryoutHeading`,
    menuItem: `${PREFIX}-menuItem`,
    tokenType: `${PREFIX}-tokenType`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.centerItems}`]: {
        margin: 'auto',
    },

    [`& .${classes.tryoutHeading}`]: {
        paddingTop: '20px',
        fontWeight: 400,
        display: 'block',
    },

    [`& .${classes.menuItem}`]: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },

    [`& .${classes.tokenType}`]: {
        margin: 'auto',
        display: 'flex',
        '& .MuiButton-contained.Mui-disabled span.MuiButton-label': {
            color: '#6d6d6d',
        },
    }
}));

// disabled because webpack magic comment for chunk name require to be in the same line
// eslint-disable-next-line max-len
const SwaggerUI = lazy(() => import('AppComponents/Apis/Details/TryOut/SwaggerUI' /* webpackChunkName: "TryoutConsoleSwaggerUI" */));

dayjs.extend(relativeTime);

const tasksReducer = (state, action) => {
    const { name, status } = action;
    // In the case of a key collision, the right-most (last) object's value wins out
    return { ...state, [name]: { ...state[name], ...status } };
};

/**
 * @class TryOutConsole
 * @extends {React.Component}
 */
const TryOutConsole = () => {

    const [api] = useAPI();
    const [apiKey, setAPIKey] = useState(null);
    const [deployments, setDeployments] = useState([]);
    const [selectedDeployment, setSelectedDeployment] = useState();
    const [oasDefinition, setOasDefinition] = useState();
    const [advAuthHeader, setAdvAuthHeader] = useState('Authorization');
    const [advAuthHeaderValue, setAdvAuthHeaderValue] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('PRODUCTION');
    const { data: publisherSettings } = usePublisherSettings();

    const [tasksStatus, tasksStatusDispatcher] = useReducer(tasksReducer, {
        generateKey: { inProgress: false, completed: false, error: false },
        getOAS: { inProgress: false, completed: false, error: false },
        getDeployments: { inProgress: false, completed: false, error: false },
    });

    const generateInternalKey = useCallback(() => {
        tasksStatusDispatcher({ name: 'generateKey', status: { inProgress: true } });
        Api.generateInternalKey(api.id).then((keyResponse) => {
            const { apikey } = keyResponse.body;
            setAPIKey(apikey);
            tasksStatusDispatcher({ name: 'generateKey', status: { inProgress: false, completed: true } });
        }).catch((error) => tasksStatusDispatcher({ name: 'generateKey', status: { error, inProgress: false } }));
    }, [api.id]);
    useEffect(generateInternalKey, []); // Auto generate API Key on page load
    useEffect(() => {
        tasksStatusDispatcher({ name: 'getDeployments', status: { inProgress: true } });
        if (publisherSettings) {
            api.getDeployedRevisions(api.id).then((deploymentsResponse) => {
                tasksStatusDispatcher({ name: 'getDeployments', status: { inProgress: false, completed: true } });
                const currentDeployments = deploymentsResponse.body;
                const currentDeploymentsWithDisplayName = currentDeployments
                    .filter(deploy => deploy.status !== 'CREATED').map((deploy) => {
                        const gwEnvironment = publisherSettings.environment.find((e) => e.name === deploy.name);
                        const displayName = (gwEnvironment ? gwEnvironment.displayName : deploy.name);
                        return { ...deploy, displayName };
                    });
                setDeployments(currentDeploymentsWithDisplayName);
                if (currentDeploymentsWithDisplayName && currentDeploymentsWithDisplayName.length > 0) {
                    const [initialDeploymentSelection] = currentDeploymentsWithDisplayName;
                    setSelectedDeployment(initialDeploymentSelection);
                }
            }).catch(
                (error) => tasksStatusDispatcher({ name: 'getDeployments', status: { inProgress: false, error } }),
            );
            api.getSwagger().then((swaggerResponse) => setOasDefinition(swaggerResponse.body));
        }
    }, [publisherSettings]);

    const isAdvertised = api.advertiseInfo && api.advertiseInfo.advertised;
    const setServersSpec = (spec, serverUrl) => {
        let schemes;
        const [protocol, host] = serverUrl.split('://');
        if (protocol === 'http') {
            schemes = ['http'];
        } else if (protocol === 'https') {
            schemes = ['https'];
        }
        return {
            ...spec,
            schemes,
            host,
        };
    };
    const updatedOasDefinition = useMemo(() => {
        let oasCopy;
        if (selectedDeployment && oasDefinition) {
            const selectedGWEnvironment = publisherSettings.environment
                .find((env) => env.name === selectedDeployment.name);
            let selectedDeploymentVhost = selectedGWEnvironment && selectedGWEnvironment.vhosts
                .find((vhost) => vhost.host === selectedDeployment.vhost);
            if (!selectedDeploymentVhost) {
                selectedDeploymentVhost = { ...CONSTS.DEFAULT_VHOST, host: selectedDeployment.vhost };
            }
            let pathSeparator = '';
            if (selectedDeploymentVhost.httpContext && !selectedDeploymentVhost.httpContext.startsWith('/')) {
                pathSeparator = '/';
            }
            oasCopy = cloneDeep(oasDefinition); // If not we are directly mutating the state
            if (oasDefinition.openapi) { // Assumed as OAS 3.x definition
                const unfilteredServers = api.transport.map((transport) => {
                    const transportPort = selectedDeploymentVhost[`${transport}Port`];
                    if (!transportPort) {
                        console.error(`Can't find ${transport}Port `
                            + `in selected deployment ( ${selectedDeploymentVhost.name} )`);
                    }
                    if (transportPort !== -1) {
                        const baseURL = `${transport}://${selectedDeployment.vhost}:${transportPort}`;
                        let url = `${baseURL}${pathSeparator}`
                            + `${selectedDeploymentVhost.httpContext}${api.context}/${api.version}`;
                        if (`${api.context}`.includes('{version}')) {
                            url = `${baseURL}${pathSeparator}`
                                        + `${selectedDeploymentVhost.httpContext}${api.context}`
                                            .replaceAll('{version}', `${api.version}`);
                        }
                        return {url};
                    }
                    return null;
                });
                const servers = unfilteredServers.filter(url => url);
                oasCopy.servers = servers.sort((a, b) => ((a.url > b.url) ? -1 : 1));
            } else { // Assume the API definition is Swagger 2
                let transportPort = selectedDeploymentVhost.httpsPort;
                if (api.transport.length === 1 && !api.transport.includes('https')) {
                    transportPort = selectedDeploymentVhost.httpPort;
                } else if (api.transport.length > 1) {
                    // TODO: fix When both HTTP and HTTPs transports are available can't switch the port between them
                    // ~tmkb
                    console.warn('HTTPS transport port will be used for all other transports');
                }
                const host = `${selectedDeploymentVhost.host}:${transportPort}`;
                let basePath;

                basePath = `${pathSeparator}${selectedDeploymentVhost.
                    httpContext}${api.context}/${api.version}`;

                if (`${api.context}`.includes('{version}')) {
                    basePath = `${pathSeparator}${selectedDeploymentVhost
                        .httpContext}${api.context}`.replaceAll('{version}', `${api.version}`);
                }

                let schemes = api.transport.slice().sort((a, b) => ((a > b) ? -1 : 1));
                if (selectedDeploymentVhost.httpPort === -1){
                    schemes = schemes.filter(item => item !== 'http');
                }
                if (selectedDeploymentVhost.httpsPort === -1){
                    schemes = schemes.filter(item => item !== 'https');
                }
                oasCopy.schemes = schemes;
                oasCopy.basePath = basePath;
                oasCopy.host = host;
            }
        } else if (oasDefinition) {
            // If no deployment just show the OAS definition
            oasCopy = oasDefinition;
        }
        if (oasCopy && isAdvertised) {
            if (oasCopy.openapi) {
                // Assume the API definition is an OAS 3.x definition
                if (selectedEndpoint === 'PRODUCTION') {
                    oasCopy = {
                        ...oasCopy,
                        servers: [
                            { url: api.advertiseInfo.apiExternalProductionEndpoint },
                        ]
                    };
                } else {
                    oasCopy = {
                        ...oasCopy,
                        servers: [
                            { url: api.advertiseInfo.apiExternalSandboxEndpoint },
                        ]
                    };
                }
            } else if (selectedEndpoint === 'PRODUCTION') {
                // Assume the API definition is Swagger 2
                oasCopy = setServersSpec(oasCopy, api.advertiseInfo.apiExternalProductionEndpoint);
            } else {
                oasCopy = setServersSpec(oasCopy, api.advertiseInfo.apiExternalSandboxEndpoint);
            }
        }
        return oasCopy;
    }, [selectedEndpoint, selectedDeployment, oasDefinition, publisherSettings]);

    /**
     *
     * @param {React.SyntheticEventn} event
     */
    const deploymentSelectionHandler = (event) => {
        const selectedGWEnvironment = event.target.value;
        const currentSelection = deployments.find((deployment) => deployment.name === selectedGWEnvironment);
        setSelectedDeployment(currentSelection);
    };
    const decodedJWT = useMemo(() => Utils.decodeJWT(apiKey || ''), [apiKey]);
    const isAPIRetired = api.lifeCycleStatus === 'RETIRED';

    const accessTokenProvider = () => {
        if (isAdvertised) {
            return advAuthHeaderValue;
        }
        return apiKey;
    }; 

    const getAuthorizationHeader = () => {
        if (isAdvertised) {
            return advAuthHeader;
        }
        return 'Internal-Key';
    };

    return (
        (<Root>
            <Typography id='itest-api-details-try-out-head' variant='h4' component='h2'>
                <FormattedMessage id='Apis.Details.ApiConsole.ApiConsole.title' defaultMessage='Try Out' />
            </Typography>
            <Paper elevation={0} sx={{ mt: 1, p: 3 }}>
                {(!api.advertiseInfo || !api.advertiseInfo.advertised) ? (
                    <>
                        <Box display='flex' justifyContent='center' sx={{ mb: 3 }}>
                            <Grid container>
                                <Grid item xs={3} />
                                <Grid xs={6} md={6} item>
                                    <Typography variant='h5' component='h3' color='textPrimary'>
                                        <FormattedMessage
                                            id='api.console.security.heading'
                                            defaultMessage='Security'
                                        />
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label={(
                                            <FormattedMessage
                                                id='Apis.Details.TryOutConsole.token.label'
                                                defaultMessage='Internal API Key'
                                            />
                                        )}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        type='password'
                                        value={apiKey}
                                        helperText={decodedJWT ? (
                                            <Box color='success.main'>
                                                {`Expires ${dayjs.unix(decodedJWT.payload.exp).fromNow()}`}
                                            </Box>
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Details.TryOutConsole.token.helper'
                                                defaultMessage='Generate or provide an internal API Key'
                                            />
                                        )}
                                        margin='normal'
                                        variant='outlined'
                                        name='internal'
                                        multiline
                                        rows={4}
                                        onChange={(e) => setAPIKey(e.target.value)}
                                        disabled={isAPIRetired}
                                    />
                                    <Button
                                        onClick={generateInternalKey}
                                        variant='contained'
                                        color='primary'
                                        disabled={tasksStatus.generateKey.inProgress || isAPIRetired
                                        || isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.ApiConsole.generate.test.key'
                                            defaultMessage='Generate Key'
                                        />
                                    </Button>
                                    {tasksStatus.generateKey.inProgress
                                    && (
                                        <Box
                                            display='inline'
                                            position='absolute'
                                            mt={1}
                                            ml={-8}
                                        >
                                            <CircularProgress size={24} />
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                        <Box display='flex' justifyContent='center'>
                            <Grid container>
                                <Grid item xs={3} />
                                <Grid xs={6} md={6} item>
                                    {(tasksStatus.getDeployments.completed && !deployments.length && !isAPIRetired) && (
                                        <Alert variant='outlined' severity='error'>
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.deployments.no'
                                                defaultMessage={'{artifactType} is not deployed yet! Please deploy '
                                                + 'the {artifactType} before trying out'}
                                                values={{ artifactType: api.isRevision ? 'Revision' : 'API' }}
                                            />
                                            <Link to={'/apis/' + api.id + '/deployments'}>
                                                <LaunchIcon
                                                    color='primary'
                                                    fontSize='small'
                                                />
                                            </Link>
                                        </Alert>
                                    )}
                                    {isAPIRetired && (
                                        <Alert variant='outlined' severity='error'>
                                            <FormattedMessage
                                                id='Apis.Details.ApiConsole.deployments.isAPIRetired'
                                                defaultMessage='Can not Try Out retired APIs!'
                                            />
                                        </Alert>
                                    )}
                                    {((deployments && deployments.length > 0))
                                    && (
                                        <>
                                            <Typography
                                                variant='h5'
                                                component='h3'
                                                color='textPrimary'
                                            >
                                                <FormattedMessage
                                                    id='Apis.Details.ApiConsole.deployments.api.gateways'
                                                    defaultMessage='API Gateways'
                                                />
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                select
                                                label={(
                                                    <FormattedMessage
                                                        defaultMessage='Environment'
                                                        id='Apis.Details.ApiConsole.environment'
                                                    />
                                                )}
                                                value={(selectedDeployment && selectedDeployment.name) || ''}
                                                name='selectedEnvironment'
                                                onChange={deploymentSelectionHandler}
                                                margin='normal'
                                                variant='outlined'
                                                SelectProps={{
                                                    MenuProps: {
                                                        getContentAnchorEl: null,
                                                    },
                                                }}
                                            >
                                                {deployments.map((deployment) => (
                                                    <MenuItem
                                                        value={deployment.name}
                                                        key={deployment.name}
                                                    >
                                                        {deployment.displayName}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                        </Box>
                    </>
                ) : (
                    <AdvertiseDetailsPanel
                        classes={classes}
                        advAuthHeader={advAuthHeader}
                        setAdvAuthHeader={setAdvAuthHeader}
                        advAuthHeaderValue={advAuthHeaderValue}
                        setAdvAuthHeaderValue={setAdvAuthHeaderValue}
                        selectedEndpoint={selectedEndpoint}
                        setSelectedEndpoint={setSelectedEndpoint}
                        advertiseInfo={api.advertiseInfo}
                    />
                )}
                {updatedOasDefinition && apiKey !== null ? (
                    <Suspense
                        fallback={(
                            <CircularProgress />
                        )}
                    >
                        <SwaggerUI
                            api={api}
                            accessTokenProvider={accessTokenProvider}
                            spec={updatedOasDefinition}
                            authorizationHeader={getAuthorizationHeader()}
                        />
                    </Suspense>
                ) : <CircularProgress />}
            </Paper>
        </Root>)
    );
};
TryOutConsole.propTypes = {
    classes: PropTypes.shape({
        paper: PropTypes.string.isRequired,
        titleSub: PropTypes.string.isRequired,
        grid: PropTypes.string.isRequired,
        userNotificationPaper: PropTypes.string.isRequired,
        buttonIcon: PropTypes.string.isRequired,
        lcState: PropTypes.shape({}).isRequired,
        theme: PropTypes.shape({}).isRequired,
        intl: PropTypes.shape({
            formatMessage: PropTypes.func,
        }).isRequired,
    }).isRequired,
};

export default (TryOutConsole);
