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

import React, { useState, useContext, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Utils from 'AppData/Utils';
import Alert from 'AppComponents/Shared/Alert';
import { FormattedMessage, injectIntl } from 'react-intl';
import LaunchIcon from '@mui/icons-material/Launch';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import { isRestricted } from 'AppData/AuthManager';
import { Link, useHistory } from 'react-router-dom';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import { useAppContext, usePublisherSettings } from 'AppComponents/Shared/AppContext';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';
import ThumbnailView from 'AppComponents/Apis/Listing/components/ImageGenerator/ThumbnailView';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import GoTo from 'AppComponents/Apis/Details/GoTo/GoTo';
import Tooltip from '@mui/material/Tooltip';
import API from 'AppData/api';
import MUIAlert from 'AppComponents/Shared/MuiAlert';
import DeleteApiButton from './DeleteApiButton';
import CreateNewVersionButton from './CreateNewVersionButton';
import ShareButton from './ShareButton';

const PREFIX = 'APIDetailsTopMenu';
const classes = {
    root: `${PREFIX}-root`,
    backLink: `${PREFIX}-backLink`,
    backIcon: `${PREFIX}-backIcon`,
    backText: `${PREFIX}-backText`,
    viewInStoreLauncher: `${PREFIX}-viewInStoreLauncher`,
    linkText: `${PREFIX}-linkText`,
    dateWrapper: `${PREFIX}-dateWrapper`,
    lastUpdatedTypography: `${PREFIX}-lastUpdatedTypography`,
    apiName: `${PREFIX}-apiName`,
    downloadApi: `${PREFIX}-downloadApi`,
    downloadApiFlex: `${PREFIX}-downloadApiFlex`,
    revisionWrapper: `${PREFIX}-revisionWrapper`,
    topRevisionStyle: `${PREFIX}-topRevisionStyle`,
    readOnlyStyle: `${PREFIX}-readOnlyStyle`,
    active: `${PREFIX}-active`,
    alertMargin: `${PREFIX}-alertMargin`,
};

const Root = styled('div')(({ theme }) => ({
    [`.${classes.root}`]: {
        height: theme.custom.apis.topMenu.height,
        background: theme.palette.background.paper,
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
    },
    [`.${classes.backLink}`]: {
        alignItems: 'center',
        textDecoration: 'none',
        display: 'contents',
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    [`.${classes.backIcon}`]: {
        color: theme.palette.primary.main,
        fontSize: 56,
        cursor: 'pointer',
    },
    [`.${classes.backText}`]: {
        color: theme.palette.primary.main,
        cursor: 'pointer',
        fontFamily: theme.typography.fontFamily,
    },
    [`.${classes.viewInStoreLauncher}`]: {
        display: 'flex',
        flexDirection: 'column',
        color: theme.palette.getContrastText(theme.palette.background.paper),
        textAlign: 'center',
        justifyContent: 'center',
        height: 70,
    },
    [`.${classes.linkText}`]: {
        fontSize: theme.typography.fontSize,
    },
    [`.${classes.dateWrapper}`]: {
        flex: 1,
        alignSelf: 'center',
    },
    [`.${classes.lastUpdatedTypography}`]: {
        display: 'inline-block',
        minWidth: 30,
    },
    [`.${classes.apiName}`]: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    [`.${classes.downloadApi}`]: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        height: 70,
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    [`.${classes.downloadApiFlex}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
    [`.${classes.revisionWrapper}`]: {
        paddingRight: theme.spacing(2),
    },
    [`.${classes.topRevisionStyle}`]: {
        marginLeft: theme.spacing(1),
        maxWidth: 500,
    },
    [`.${classes.readOnlyStyle}`]: {
        color: 'red',
    },
    [`.${classes.active}`]: {
        background: theme.custom.revision.activeRevision.background,
        width: 8,
        height: 8,
        borderRadius: '50%',
        alignItems: 'center',
    },
    [`.${classes.alertMargin}`]: {
        marginLeft: theme.spacing(1),
    },
}));

const APIDetailsTopMenu = (props) => {
    const {
        api, isAPIProduct, imageUpdate, intl, openPageSearch, setOpenPageSearch, updateAPI
    } = props;
    const theme = useTheme();
    const history = useHistory();
    const prevLocation = history.location.pathname;
    const lastIndex = prevLocation.split('/')[3];
    const [revisionId, setRevisionId] = useState(api.id);
    let lifecycleState;
    let isVisibleInStore;
    if (isAPIProduct) {
        lifecycleState = api.state === 'PROTOTYPED' ? 'PRE-RELEASED' : api.state;
        isVisibleInStore = ['PROTOTYPED', 'PUBLISHED'].includes(api.state);
    } else {
        lifecycleState = api.lifeCycleStatus === 'PROTOTYPED' ? 'PRE-RELEASED' : api.lifeCycleStatus;
        isVisibleInStore = ['PROTOTYPED', 'PUBLISHED'].includes(api.lifeCycleStatus);
    }
    const ApiLifeCycleStates = {
        CREATED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.CREATED', defaultMessage: 'CREATED',
        }),
        PUBLISHED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.PUBLISHED', defaultMessage: 'PUBLISHED',
        }),
        DEPRECATED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.DEPRECATED', defaultMessage: 'DEPRECATED',
        }),
        RETIRED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.RETIRED', defaultMessage: 'RETIRED',
        }),
        BLOCKED: intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.BLOCKED', defaultMessage: 'BLOCKED',
        }),
        'PRE-RELEASED': intl.formatMessage({
            id: 'Apis.Details.LifeCycle.State.Status.PRE-RELEASED', defaultMessage: 'PRE-RELEASED',
        }),
    };

    const [userOrg, setUserOrg] = useState(null);

    useEffect(() => {
        new API()
            .getUserOrganizationInfo()
            .then((result) => {
                setUserOrg(result.body.organizationId);
            })
            .catch((error) => {
                throw error;
            });
    }, []);

    /**
         * The component for advanced endpoint configurations.
         * @param {string} name The name of the
         * @param {string} version Version of the API
         * @param {string} provider Provider of the API
         * @param {string} format Weather to recive files in YALM of JSON format
         * @returns {zip} Zpi file containing the API directory.
     */
    function exportAPI() {
        return api.export().then((zipFile) => {
            return Utils.forceDownload(zipFile);
        }).catch((error) => {
            console.error(error);
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.components.APIDetailsTopMenu.error',
                    defaultMessage: 'Something went wrong while downloading the API.',
                }));
            }
        });
    }

    const handleChange = (event) => {
        setRevisionId(event.target.value);
    };

    /**
     * Update the state when new props are available
     */
    useEffect(() => {
        setRevisionId(api.id);
    }, [api.id]);

    const isDownloadable = [API.CONSTS.API, API.CONSTS.APIProduct].includes(api.apiType);
    const { user } = useAppContext();
    const { data: settings } = usePublisherSettings();
    const { allRevisions, allEnvRevision } = useRevisionContext();
    const { tenantList } = useContext(ApiContext);
    const userNameSplit = user.name.split('@');
    const tenantDomain = userNameSplit[userNameSplit.length - 1];
    let devportalUrl = settings ? `${settings.devportalUrl}/apis/${api.id}/overview` : '';
    if (tenantList && tenantList.length > 0) {
        devportalUrl = settings ? `${settings.devportalUrl}/apis/${api.id}/overview?tenant=${tenantDomain}` : '';
    }

    function getDeployments(revisionKey) {
        const array = [];
        allEnvRevision.filter(
            (env) => env.id === revisionKey,
        )[0].deploymentInfo.map((environment) => array.push(environment.name));
        return array.join(', ');
    }

    // todo: need to support rev proxy ~tmkb
    return (
        <Root>
            <div className={classes.root}>
                <Link
                    to={isAPIProduct
                        ? `/api-products/${api.id}/overview`
                        : `/apis/${api.id}/overview`}
                    className={classes.backLink}
                >
                    <Box width={70} height={50} marginLeft={1}>
                        <ThumbnailView api={api} width={70} height={50} imageUpdate={imageUpdate}
                            updateAPI={updateAPI} />
                    </Box>
                    <div style={{ marginLeft: theme.spacing(1), maxWidth: 500 }}>
                        <Link
                            to={isAPIProduct
                                ? `/api-products/${api.id}/overview`
                                : `/apis/${api.id}/overview`}
                            className={classes.backLink}
                        >
                            <Typography id='itest-api-name-version' variant='h4' component='h1' 
                                className={classes.apiName}>
                                {api.name}
                                {' :'}
                                {api.version}
                            </Typography>
                            <Typography variant='caption' gutterBottom align='left'>
                                <FormattedMessage
                                    id='Apis.Details.components.APIDetailsTopMenu.created.by'
                                    defaultMessage='Created by:'
                                />
                                {' '}
                                {api.provider}
                            </Typography>
                        </Link>
                    </div>
                </Link>
                <VerticalDivider height={70} />
                <div className={classes.infoItem}>
                    <Typography data-testid='itest-api-state' component='div' variant='subtitle1'>
                        {lifecycleState in ApiLifeCycleStates
                            ? ApiLifeCycleStates[lifecycleState] : lifecycleState}
                    </Typography>
                    <Typography variant='caption' align='left'>
                        <FormattedMessage
                            id='Apis.Details.components.APIDetailsTopMenu.state'
                            defaultMessage='State'
                        />
                    </Typography>
                </div>

                <div className={classes.dateWrapper} />
                {api.isRevision && (
                    <MUIAlert
                        variant='outlined'
                        severity='warning'
                        icon={false}
                        className={classes.alertMargin}
                    >
                        <FormattedMessage
                            id='Apis.Details.components.APIDetailsTopMenu.read.only.label'
                            defaultMessage='Read only'
                        />
                    </MUIAlert>
                )}
                {(api.subtypeConfiguration?.subtype === 'AIAPI') && (
                    <MUIAlert
                        data-testid='itest-ai-api-label'
                        variant='outlined'
                        severity='info'
                        icon={false}
                        className={classes.alertMargin}
                    >
                        <FormattedMessage
                            id='Apis.Details.components.APIDetailsTopMenu.ai.api.label'
                            defaultMessage='AI/LLM API'
                        />
                    </MUIAlert>
                )}
                {(api.advertiseInfo && api.advertiseInfo.advertised) && (
                    <MUIAlert
                        data-testid='itest-third-party-api-label'
                        variant='outlined'
                        severity='warning'
                        icon={false}
                        className={classes.alertMargin}
                    >
                        <FormattedMessage
                            id='Apis.Details.components.APIDetailsTopMenu.advertise.only.label'
                            defaultMessage='Third Party'
                        />
                    </MUIAlert>
                )}
                {(!api.advertiseInfo || !api.advertiseInfo.advertised) && (
                    <div className={classes.topRevisionStyle}>
                        <TextField
                            id='revision-selector'
                            value={revisionId}
                            select
                            SelectProps={{
                                MenuProps: {
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    getContentAnchorEl: null,
                                },
                            }}
                            name='selectRevision'
                            onChange={handleChange}
                            margin='dense'
                            variant='outlined'
                        >
                            {!isAPIProduct ? (
                                <MenuItem
                                    value={api.isRevision ? api.revisionedApiId : api.id}
                                    component={Link}
                                    to={'/apis/' + (api.isRevision ? api.revisionedApiId : api.id) + '/' + lastIndex}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.components.APIDetailsTopMenu.current.api'
                                        defaultMessage='Current API'
                                    />
                                </MenuItem>
                            ) : (
                                <MenuItem
                                    value={api.isRevision ? api.revisionedApiProductId : api.id}
                                    component={Link}
                                    to={'/api-products/' + (api.isRevision
                                        ? api.revisionedApiProductId : api.id) + '/' + lastIndex}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.components.APIDetailsTopMenu.current.api'
                                        defaultMessage='Current API'
                                    />
                                </MenuItem>
                            )}
                            {allRevisions && !isAPIProduct && allRevisions.map((item) => (
                                <MenuItem key={item.id} 
                                    value={item.id} component={Link} to={'/apis/' + item.id + '/' + lastIndex}>
                                    <Grid
                                        container
                                        direction='row'
                                        alignItems='center'
                                    >
                                        <Grid item>
                                            {item.displayName}
                                        </Grid>
                                        {allEnvRevision && allEnvRevision.find((env) => env.id === item.id) && (
                                            <Grid item>
                                                <Box ml={2}>
                                                    <Tooltip
                                                        title={getDeployments(item.id)}
                                                        placement='bottom'
                                                    >
                                                        <Grid className={classes.active} />
                                                    </Tooltip>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </MenuItem>
                            ))}
                            {allRevisions && isAPIProduct && allRevisions.map((item) => (
                                <MenuItem
                                    value={item.id}
                                    component={Link}
                                    to={'/api-products/' + item.id + '/' + lastIndex}
                                >
                                    <Grid
                                        container
                                        direction='row'
                                        alignItems='center'
                                    >
                                        <Grid item>
                                            {item.displayName}
                                        </Grid>
                                        {allEnvRevision && allEnvRevision.find((env) => env.id === item.id) && (
                                            <Grid item>
                                                <Box ml={2}>
                                                    <Tooltip
                                                        title={getDeployments(item.id)}
                                                        placement='bottom'
                                                    >
                                                        <Grid className={classes.active} />
                                                    </Tooltip>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>
                )}

                <VerticalDivider height={70} />
                <GoTo
                    setOpenPageSearch={setOpenPageSearch}
                    openPageSearch={openPageSearch}
                    api={api}
                    isAPIProduct={isAPIProduct}
                />
                {(isVisibleInStore) && <VerticalDivider height={70} />}
                {(isVisibleInStore) && (
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        href={devportalUrl}
                        className={classes.viewInStoreLauncher}
                        style={{ minWidth: 90 }}
                    >
                        <div>
                            <LaunchIcon />
                        </div>
                        <Typography variant='caption'>
                            <FormattedMessage
                                id='Apis.Details.components.APIDetailsTopMenu.view.in.portal'
                                defaultMessage='View in Dev Portal'
                            />
                        </Typography>
                    </a>
                )}
                {/* Page error banner */}
                {/* end of Page error banner */}
                {api.apiType !== API.CONSTS.APIProduct && isVisibleInStore && userOrg 
                    ? <>
                        <ShareButton buttonClass={classes.viewInStoreLauncher}
                            api={api} isAPIProduct={isAPIProduct} />
                    </> : null
                }
                {api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled)
                    ? null :
                    <>
                        <CreateNewVersionButton buttonClass={classes.viewInStoreLauncher}
                            api={api} isAPIProduct={isAPIProduct} />
                    </>}
                {(isDownloadable) && <VerticalDivider height={70} />}
                <div className={classes.downloadApi}>
                    {(isDownloadable) && (
                        <a
                            onClick={exportAPI}
                            onKeyDown={null}
                            className={classes.downloadApiFlex}
                            id='download-api-btn'
                        >
                            <div>
                                <CloudDownloadRounded />
                            </div>
                            <Typography variant='caption' align='left'>
                                <FormattedMessage
                                    id='Apis.Details.APIDetailsTopMenu.download.api'
                                    defaultMessage='Download API'
                                />
                            </Typography>
                        </a>
                    )}
                </div>
                {api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled)
                    || isRestricted(['apim:api_create'], api)
                    ? (<div className={classes.revisionWrapper} />)
                    : (
                        <DeleteApiButton 
                            buttonClass={classes.viewInStoreLauncher} 
                            api={api} 
                            isAPIProduct={isAPIProduct} 
                        />
                    )
                }
            </div>
        </Root>
    );
};

APIDetailsTopMenu.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        subtypeConfiguration: PropTypes.shape({}),
    }).isRequired,
    isAPIProduct: PropTypes.bool.isRequired,
    imageUpdate: PropTypes.number.isRequired,
};

export default injectIntl(APIDetailsTopMenu);
