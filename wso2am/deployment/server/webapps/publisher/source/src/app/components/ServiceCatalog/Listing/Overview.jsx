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

import React, {
    useState,
    useEffect,
    lazy,
    Suspense,
} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Configurations from 'Config';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { Progress } from 'AppComponents/Shared';
import Alert from 'AppComponents/Shared/Alert';
import ServiceCatalog from 'AppData/ServiceCatalog';
import Container from '@mui/material/Container';
import Utils from 'AppData/Utils';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CreateApi from 'AppComponents/ServiceCatalog/CreateApi';
import Usages from 'AppComponents/ServiceCatalog/Listing/Usages';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import { isRestricted } from 'AppData/AuthManager';
import YAML from 'js-yaml';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import beautify from 'xml-beautifier';
import { Editor as MonacoEditor } from '@monaco-editor/react';

const PREFIX = 'Overview';

const classes = {
    preview: `${PREFIX}-preview`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    iconAligner: `${PREFIX}-iconAligner`,
    tableIcon: `${PREFIX}-tableIcon`,
    bodyStyle: `${PREFIX}-bodyStyle`,
    contentTopBarStyle: `${PREFIX}-contentTopBarStyle`,
    table: `${PREFIX}-table`,
    iconTextWrapper: `${PREFIX}-iconTextWrapper`,
    versionBarStyle: `${PREFIX}-versionBarStyle`,
    topBarDetailsSectionStyle: `${PREFIX}-topBarDetailsSectionStyle`,
    versionStyle: `${PREFIX}-versionStyle`,
    apiUsageStyle: `${PREFIX}-apiUsageStyle`,
    headingSpacing: `${PREFIX}-headingSpacing`,
    buttonWrapper: `${PREFIX}-buttonWrapper`,
    buttonSection: `${PREFIX}-buttonSection`,
    paperStyle: `${PREFIX}-paperStyle`,
    downloadServiceFlex: `${PREFIX}-downloadServiceFlex`,
    downloadServiceGroup: `${PREFIX}-downloadServiceGroup`,
    iconSpacing: `${PREFIX}-iconSpacing`,
    button: `${PREFIX}-button`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    downloadButtonSpacing: `${PREFIX}-downloadButtonSpacing`,
    editorPane: `${PREFIX}-editorPane`,
    editorRoot: `${PREFIX}-editorRoot`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.preview}`]: {
        height: theme.spacing(16),
        marginBottom: theme.spacing(3),
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.contentWrapper}`]: {
        marginTop: theme.spacing(3),
        alignItems: 'center',
    },

    [`& .${classes.iconAligner}`]: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    [`& .${classes.tableIcon}`]: {
        width: theme.spacing(3),
    },

    [`& .${classes.bodyStyle}`]: {
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.contentTopBarStyle}`]: {
        display: 'flex',
    },

    [`& .${classes.table}`]: {
        minWidth: '100%',
    },

    [`& .${classes.iconTextWrapper}`]: {
        display: 'inline-block',
        paddingLeft: 20,
    },

    [`& .${classes.versionBarStyle}`]: {
        marginTop: theme.spacing(1),
        display: 'flex',
    },

    [`& .${classes.topBarDetailsSectionStyle}`]: {
        marginLeft: theme.spacing(5),
    },

    [`& .${classes.versionStyle}`]: {
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.apiUsageStyle}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.headingSpacing}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.buttonWrapper}`]: {
        paddingTop: 10,
    },

    [`& .${classes.buttonSection}`]: {
        paddingTop: theme.spacing(1),
        marginLeft: theme.spacing(2),
    },

    [`& .${classes.paperStyle}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.downloadServiceFlex}`]: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: -8,
    },

    [`& .${classes.downloadServiceGroup}`]: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: -8,
    },

    [`& .${classes.iconSpacing}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.downloadButtonSpacing}`]: {
        marginLeft: theme.spacing(1),
    },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(2),
    },

    [`& .${classes.editorPane}`]: {
        width: '50%',
        height: '100%',
        overflow: 'scroll',
    },

    [`& .${classes.editorRoot}`]: {
        height: '100%',
    }
}));

dayjs.extend(relativeTime);
// disabled because webpack magic comment for chunk name require to be in the same line
// eslint-disable-next-line max-len
const SwaggerUI = lazy(() => import('AppComponents/Apis/Details/APIDefinition/swaggerUI/SwaggerUI' /* webpackChunkName: "ServiceOverviewSwaggerUI" */));

/**
 * Service Catalog Overview Page
 *
 * @param {any} props props
 * @returns {any} Overview page of a service
 */
function Overview(props) {

    const intl = useIntl();
    const { match, history } = props;
    const serviceId = match.params.service_uuid;
    const [service, setService] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [serviceDefinition, setServiceDefinition] = useState(null);
    const [openReadOnlyDefinition, setOpenReadOnlyDefinition] = useState(false);
    const [format, setFormat] = useState('yaml');
    const theme = useTheme();
    const {
        graphqlIcon,
        restApiIcon,
        soapApiIcon,
        streamingApiIcon,
    } = theme.custom.landingPage.icons;

    // Get Service Details
    const getService = () => {
        const promisedService = ServiceCatalog.getServiceById(serviceId);
        promisedService.then((data) => {
            setService(data);
        }).catch((error) => {
            Alert.error(intl.formatMessage({
                defaultMessage: 'Error while loading service',
                id: 'ServiceCatalog.Listing.Overview.error.loading.service',
            }));
            const { status } = error;
            if (status === 404) {
                setNotFound(true);
            }
        });
        return null;
    };

    /**
     * Download Service Definition
     * @param {string} serviceKey The service id.
     * @param {string} serviceDefinitionType The service definitionType.
     * @returns {Object} Service Definition File.
     */
    function downloadServiceDefinition(serviceKey, serviceDefinitionType) {
        return ServiceCatalog.getServiceDefinition(serviceKey).then((file) => {
            let currentServiceDefinition = null;
            if (service.definitionType === 'WSDL1' || service.definitionType === 'WSDL2') {
                currentServiceDefinition = beautify(file);
            } else if (service.definitionType !== 'GRAPHQL_SDL') {
                currentServiceDefinition = file;
            } else {
                currentServiceDefinition = file.obj.schemaDefinition;
            }
            return Utils.downloadServiceDefinition(currentServiceDefinition, serviceDefinitionType);
        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'ServiceCatalog.Listing.Overview.download.service.error',
                    defaultMessage: 'Something went wrong while downloading the Service Definition.',
                }));
            }
        });
    }

    const showServiceDefinition = () => {
        if (!serviceDefinition) {
            const promisedServiceDefinition = ServiceCatalog.getServiceDefinition(serviceId);
            promisedServiceDefinition.then((data) => {
                if (service.definitionType === 'WSDL1' || service.definitionType === 'WSDL2') {
                    setServiceDefinition(beautify(data));
                    setFormat('xml');
                } else if (service.definitionType !== 'GRAPHQL_SDL') {
                    setServiceDefinition(YAML.safeDump(YAML.safeLoad(JSON.stringify(data))));
                    setFormat('yaml');
                } else {
                    setServiceDefinition(data.obj.schemaDefinition);
                    setFormat('txt');
                }
                setOpenReadOnlyDefinition(true);
            }).catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'ServiceCatalog.Listing.Overview.retrieve.service.def.error',
                        defaultMessage: 'Something went wrong while retrieving the Service Definition.',
                    }));
                }
            });
        } else {
            // The service definition is already loaded. Hence open editor.
            setOpenReadOnlyDefinition(true);
        }
    };

    useEffect(() => {
        getService();
    }, []);

    /**
     * Sets the state to close the swagger-editor drawer.
     * */
    function closeEditor() {
        setOpenReadOnlyDefinition(false);
    }

    const listingRedirect = () => {
        history.push('/service-catalog');
    };

    const renderContent = () => {
        if (service.mutualSSLEnabled) {
            return (
                <FormattedMessage
                    id='ServiceCatalog.Listing.Overview.mutual.ssl.enabled'
                    defaultMessage='Enabled'
                />
            );
        } else {
            return (
                <FormattedMessage
                    id='ServiceCatalog.Listing.Overview.mutual.ssl.disabled'
                    defaultMessage='Disabled'
                />
            );
        }
    };

    if (!service) {
        return <Progress per={90} message='Loading Service ...' />;
    }

    if (notFound) {
        return <ResourceNotFound />;
    }

    const getDefinitionTypeDisplayName = (definitionType) => {
        return Configurations.serviceCatalogDefinitionTypes[definitionType] || definitionType;
    };

    const getSecurityTypeDisplayName = (securityType) => {
        return Configurations.serviceCatalogSecurityTypes[securityType] || securityType;
    };

    let serviceTypeIcon = (
        <img
            className={classes.preview}
            src={Configurations.app.context + restApiIcon}
            alt='Type API'
        />
    );
    if (service.definitionType === 'OAS3' || service.definitionType === 'OAS2') {
        serviceTypeIcon = (
            <Tooltip
                position='right'
                title={(
                    <FormattedMessage
                        id='ServiceCatalog.Listing.Overview.service.type.rest.tooltip'
                        defaultMessage='REST Service'
                    />
                )}
            >
                <img
                    className={classes.preview}
                    src={Configurations.app.context + restApiIcon}
                    alt='Type Rest API'
                />
            </Tooltip>
        );
    } else if (service.definitionType === 'GRAPHQL_SDL') {
        serviceTypeIcon = (
            <Tooltip
                position='right'
                title={(
                    <FormattedMessage
                        id='ServiceCatalog.Listing.Overview.service.type.graphql.tooltip'
                        defaultMessage='GraphQL Service'
                    />
                )}
            >
                <img
                    className={classes.preview}
                    src={Configurations.app.context + graphqlIcon}
                    alt='Type GraphQL API'
                />
            </Tooltip>
        );
    } else if (service.definitionType === 'ASYNC_API') {
        serviceTypeIcon = (
            <Tooltip
                position='right'
                title={(
                    <FormattedMessage
                        id='ServiceCatalog.Listing.Overview.service.type.async.tooltip'
                        defaultMessage='Async API Service'
                    />
                )}
            >
                <img
                    className={classes.preview}
                    src={Configurations.app.context + streamingApiIcon}
                    alt='Type Async API'
                />
            </Tooltip>
        );
    } else if (service.definitionType === 'WSDL1' || service.definitionType === 'WSDL2') {
        serviceTypeIcon = (
            <Tooltip
                position='right'
                title={(
                    <FormattedMessage
                        id='ServiceCatalog.Listing.Overview.service.type.soap.tooltip'
                        defaultMessage='SOAP Service'
                    />
                )}
            >
                <img
                    className={classes.preview}
                    src={Configurations.app.context + soapApiIcon}
                    alt='Type SOAP API'
                />
            </Tooltip>
        );
    }

    const editorOptions = {
        selectOnLineNumbers: true,
        readOnly: true,
        smoothScrolling: true,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
    };

    return (
        <Root>
            <Container maxWidth='md'>
                <Box mb={3} className={classes.headingSpacing}>
                    <Breadcrumbs aria-label='breadcrumb'>
                        <Link color='inherit' to='/service-catalog'>
                            <FormattedMessage
                                id='ServiceCatalog.Listing.Overview.parent.breadcrumb'
                                defaultMessage='Service Catalog'
                            />
                        </Link>
                        <Typography color='textPrimary'>
                            <FormattedMessage
                                id='ServiceCatalog.Listing.Overview.readonly.breadcrumb'
                                defaultMessage='Overview'
                            />
                        </Typography>
                    </Breadcrumbs>
                </Box>
                <Paper elevation={1} className={classes.paperStyle}>
                    <Box px={8} py={5}>
                        <Grid container spacing={1}>
                            <Grid item md={10}>
                                <div className={classes.contentTopBarStyle}>
                                    {serviceTypeIcon}
                                    <div className={classes.topBarDetailsSectionStyle}>
                                        <div className={classes.versionBarStyle}>
                                            <Typography className={classes.heading} variant='h5'>
                                                <FormattedMessage
                                                    id='ServiceCatalog.Listing.Overview.display.name'
                                                    defaultMessage='{serviceDisplayName}'
                                                    values={{ serviceDisplayName: service.name }}
                                                />
                                            </Typography>
                                        </div>
                                        <div className={classes.versionBarStyle}>
                                            <LocalOfferOutlinedIcon />
                                            <Typography className={classes.versionStyle}>
                                                <FormattedMessage
                                                    id='ServiceCatalog.Listing.Overview.service.version'
                                                    defaultMessage='{serviceVersion}'
                                                    values={{ serviceVersion: service.version }}
                                                />
                                            </Typography>
                                        </div>
                                        <Usages
                                            usageNumber={service.usage}
                                            serviceDisplayName={service.name}
                                            serviceId={service.id}
                                            isOverview
                                            classes={classes}
                                        />
                                    </div>
                                </div>
                            </Grid>
                            <Grid item md={2}>
                                <Box display='flex' flexDirection='column'>
                                    {!isRestricted(['apim:api_create']) && (
                                        <CreateApi
                                            history={history}
                                            serviceId={service.id}
                                            serviceKey={service.serviceKey}
                                            serviceDisplayName={service.name}
                                            serviceVersion={service.version}
                                            serviceUrl={service.serviceUrl}
                                            servieDefinitionType={service.definitionType}
                                            usage={service.usage}
                                            isOverview
                                        />
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                        <div className={classes.bodyStyle}>
                            <Grid container spacing={1}>
                                { (service.description && service.description !== '') && (
                                    <>
                                        <Grid item md={12}>
                                            <Typography>
                                                <FormattedMessage
                                                    id='ServiceCatalog.Listing.Overview.service.description'
                                                    defaultMessage='{description}'
                                                    values={{ description: service.description }}
                                                />
                                            </Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                            <div className={classes.contentWrapper}>
                                <Table className={classes.table}>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component='th' scope='row'>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classes.tableIcon}>link</Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <FormattedMessage
                                                            id='ServiceCatalog.Listing.Overview.service.url'
                                                            defaultMessage='Service URL'
                                                        />
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell style={{ maxWidth: '220px', wordWrap: 'break-word' }}>
                                                {service.serviceUrl}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row'>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classes.tableIcon}>code</Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <FormattedMessage
                                                            id='ServiceCatalog.Listing.Overview.definition.type'
                                                            defaultMessage='Schema Type'
                                                        />
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getDefinitionTypeDisplayName(service.definitionType)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row'>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classes.tableIcon}>description</Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <FormattedMessage
                                                            id='ServiceCatalog.Listing.Overview.definition.download'
                                                            defaultMessage='Service Definition'
                                                        />
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={classes.downloadServiceFlex}>
                                                    <div className={classes.downloadServiceGroup}>
                                                        <Button
                                                            onClick={
                                                                () => downloadServiceDefinition(
                                                                    service.id,
                                                                    service.definitionType,
                                                                )
                                                            }
                                                            color='primary'
                                                            className={classes.downloadButtonSpacing}
                                                        >
                                                            <CloudDownloadRounded className={classes.iconSpacing} />
                                                            <FormattedMessage
                                                                id='ServiceCatalog.Listing.Overview.download.service'
                                                                defaultMessage='Download'
                                                            />
                                                        </Button>
                                                        <VerticalDivider height={30} />
                                                        <Button
                                                            onClick={showServiceDefinition}
                                                            color='primary'
                                                            endIcon={
                                                                !openReadOnlyDefinition
                                                                && <OpenInNewIcon />
                                                            }
                                                        >
                                                            <FormattedMessage
                                                                id='ServiceCatalog.Listing.Overview.view.definition'
                                                                defaultMessage='View Definition'
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <StyledDialog
                                                    fullScreen
                                                    open={openReadOnlyDefinition}
                                                    onClose={closeEditor}
                                                >
                                                    <Paper square>
                                                        <IconButton
                                                            className={classes.button}
                                                            color='inherit'
                                                            onClick={closeEditor}
                                                            aria-label={(
                                                                <FormattedMessage
                                                                    id='ServiceCatalog.Listing.Overview.close.btn'
                                                                    defaultMessage='Close'
                                                                />
                                                            )}
                                                            size='large'>
                                                            <Icon>close</Icon>
                                                        </IconButton>
                                                    </Paper>
                                                    <Suspense
                                                        fallback={(
                                                            <Progress />
                                                        )}
                                                    >
                                                        {service.definitionType !== 'WSDL1' ? (
                                                            <Grid container spacing={2} className={classes.editorRoot}>
                                                                <Grid item className={classes.editorPane}>
                                                                    <MonacoEditor
                                                                        language={format}
                                                                        width='100%'
                                                                        height='calc(100vh - 51px)'
                                                                        theme='vs-dark'
                                                                        value={serviceDefinition}
                                                                        options={editorOptions}
                                                                    />
                                                                </Grid>
                                                                <Grid item className={classes.editorPane}>
                                                                    <SwaggerUI
                                                                        url={'data:text/' + format + ','
                                                                        + encodeURIComponent(serviceDefinition)}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        ) : (
                                                            <MonacoEditor
                                                                language={format}
                                                                width='100%'
                                                                height='calc(100vh - 51px)'
                                                                theme='vs-dark'
                                                                value={serviceDefinition}
                                                                options={editorOptions}
                                                            />
                                                        )}
                                                    </Suspense>
                                                </StyledDialog>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row'>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classes.tableIcon}>security</Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <FormattedMessage
                                                            id='ServiceCatalog.Listing.Overview.security.type'
                                                            defaultMessage='Security Type'
                                                        />
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getSecurityTypeDisplayName(service.securityType)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row'>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classes.tableIcon}>sync_alt</Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <FormattedMessage
                                                            id='ServiceCatalog.Listing.Overview.mutual.ssl'
                                                            defaultMessage='Mutual SSL'
                                                        />
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                { renderContent() }
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component='th' scope='row'>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classes.tableIcon}>timeline</Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <FormattedMessage
                                                            id='ServiceCatalog.Listing.Overview.created.time'
                                                            defaultMessage='Created Time'
                                                        />
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    placement='right'
                                                    title={dayjs(service.createdTime).format('lll')}
                                                >
                                                    <span>{dayjs(service.createdTime).fromNow()}</span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className={classes.buttonWrapper}>
                            <Grid
                                container
                                direction='row'
                                alignItems='flex-start'
                                spacing={1}
                                className={classes.buttonSection}
                            >
                                <Grid item>
                                    <Button onClick={listingRedirect} color='primary'>
                                        <FormattedMessage
                                            id='ServiceCatalog.Listing.Overview.back.btn'
                                            defaultMessage='Go Back'
                                        />
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    </Box>
                </Paper>
            </Container>
        </Root>
    );
}

Overview.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({}),
    }).isRequired,
};

export default Overview;
