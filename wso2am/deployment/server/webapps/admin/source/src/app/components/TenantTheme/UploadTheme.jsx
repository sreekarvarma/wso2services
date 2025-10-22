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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    List, Button, ListItemAvatar, Typography, Toolbar, Grid, Paper, ListItem, Avatar, ListItemSecondaryAction, Box,
} from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import DescriptionIcon from '@mui/icons-material/Description';
import Link from '@mui/material/Link';
import Configurations from 'Config';
import DropZoneLocal, { humanFileSize } from 'AppComponents/Shared/DropZoneLocal';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import AlertMui from '@mui/material/Alert';
import Icon from '@mui/material/Icon';
import Utils from 'AppData/Utils';

const PREFIX = 'UploadTheme';

const classes = {
    error: `${PREFIX}-error`,
    addEditFormControl: `${PREFIX}-addEditFormControl`,
    gridRoot: `${PREFIX}-gridRoot`,
    paper: `${PREFIX}-paper`,
    warningPaper: `${PREFIX}-warningPaper`,
    downloadPaper: `${PREFIX}-downloadPaper`,
    main: `${PREFIX}-main`,
    paperUpload: `${PREFIX}-paperUpload`,
    uploadButtonGrid: `${PREFIX}-uploadButtonGrid`,
    dropbox: `${PREFIX}-dropbox`,
    browseFileButton: `${PREFIX}-browseFileButton`,
    button: `${PREFIX}-button`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    uploadFilesHeading: `${PREFIX}-uploadFilesHeading`,
    downloadBox: `${PREFIX}-downloadBox`,
    fileIcon: `${PREFIX}-fileIcon`,
    fileName: `${PREFIX}-fileName`,
    fileUploadError: `${PREFIX}-fileUploadError`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.error}`]: {
        color: theme.palette.error.dark,
    },

    [`& .${classes.addEditFormControl}`]: {
        minHeight: theme.spacing(40),
        maxHeight: theme.spacing(40),
        minWidth: theme.spacing(55),
    },

    [`& .${classes.gridRoot}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.paper}`]: {
        maxWidth: 936,
        margin: 'auto',
        overflow: 'hidden',
    },

    [`& .${classes.warningPaper}`]: {
        maxWidth: 936,
        margin: 'auto',
        overflow: 'hidden',
        marginTop: theme.spacing(2),
    },

    [`& .${classes.downloadPaper}`]: {
        maxWidth: 936,
        height: theme.spacing(8),
        margin: 'auto',
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        border: 'solid 1px ' + theme.palette.secondary.main,
    },

    [`& .${classes.main}`]: {
        flex: 1,
        padding: theme.spacing(6, 4),
        background: '#eaeff1',
    },

    [`& .${classes.paperUpload}`]: {
        maxWidth: 750,
        margin: 'auto',
        overflow: 'hidden',
        marginTop: theme.spacing(5),
    },

    [`& .${classes.uploadButtonGrid}`]: {
        display: 'grid',
        padding: '0px 345px 10px',
    },

    [`& .${classes.dropbox}`]: {
        maxWidth: 500,
        margin: 'auto',
        overflow: 'hidden',
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.browseFileButton}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(3),
        fontWeight: 600,
    },

    [`& .${classes.buttonIcon}`]: {
        marginLeft: theme.spacing(4),
        fontSize: '50px',
    },

    [`& .${classes.uploadFilesHeading}`]: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(2),
    },

    [`& .${classes.downloadBox}`]: {
        display: 'flex',
        justifyContent: 'center',
    },

    [`& .${classes.fileIcon}`]: {
        fontSize: 45,
    },

    [`& .${classes.fileName}`]: {
        marginTop: theme.spacing(1.5),
        marginLeft: theme.spacing(5),
    },

    [`& .${classes.fileUploadError}`]: {
        marginTop: theme.spacing(2),
    },
}));

/**
 * Render a pop-up dialog to add/edit an Microgateway label
 * @param {JSON} props .
 * @returns {JSX}.
 */
function UploadTheme() {
    const [themeFile, setThemeFile] = useState([]);
    const [fileName, setFileName] = useState();
    const [isFileAccepted, setIsFileAccepted] = useState(false);
    const [isUploadUnsuccessful, setIsUploadUnsuccessful] = useState(false);
    const intl = useIntl();
    const restApi = new API();

    const onDrop = (acceptedFile) => {
        setIsFileAccepted(true);
        setThemeFile(acceptedFile[0]);
    };

    useEffect(() => {
        const tenantThemeContent = restApi.exportTenantTheme();
        tenantThemeContent.then((response) => {
            const tenantFileName = response.headers['content-disposition'].split('filename=')[1];
            setFileName(tenantFileName.slice(1, -1));
        });
    }, []);

    /**
     * Downloads Tenant Theme ZIP file.
     *
     */
    const handleDownloadTenantTheme = () => {
        const tenantThemeContent = restApi.exportTenantTheme();
        tenantThemeContent.then(Utils.forceDownload)
            .catch(() => {
                Alert.error(intl.formatMessage({
                    id: 'TenantTheme.Upload.Theme.download.error',
                    defaultMessage: 'Error downloading Tenant theme ZIP file',
                }));
            });
    };

    const uploadThemeFile = () => {
        return restApi.uploadTenantTheme(themeFile)
            .then(() => {
                setIsUploadUnsuccessful(false);
                Alert.success(
                    intl.formatMessage({
                        id: 'TenantTheme.Upload.Theme.upload.successful',
                        defaultMessage: 'Theme uploaded successfully',
                    }),
                );
                setThemeFile([]);
            })
            .catch((error) => {
                setIsUploadUnsuccessful(true);
                setThemeFile([]);
                const { response } = error;
                if (response.body) {
                    Alert.error(response.body.description);
                }
            });
    };

    return (
        <Root>
            <Toolbar className={classes.root}>
                <Grid container alignItems='center' spacing={1} classes={{ root: classes.gridRoot }}>
                    <Grid item xs>
                        <Typography color='inherit' variant='h5' component='h1'>
                            <FormattedMessage
                                id='TenantTheme.Upload.Theme.page.heading'
                                defaultMessage='Manage Tenant Theme'
                            />
                        </Typography>
                    </Grid>

                    <Grid item>
                        <HelpBase>
                            <List component='nav' aria-label='main mailbox folders'>
                                <ListItem button>
                                    <ListItemIcon>
                                        <DescriptionIcon />
                                    </ListItemIcon>
                                    <Link
                                        target='_blank'
                                        href={Configurations.app.docUrl
                                            + 'reference/customize-product/customizations/'
                                            + 'customizing-the-developer-portal/'
                                            + 'overriding-developer-portal-theme/#tenant-theming'}
                                        underline='hover'
                                    >
                                        <ListItemText primary={(
                                            <FormattedMessage
                                                id='TenantTheme.Upload.Theme.help.link.one'
                                                defaultMessage='Tenant theming'
                                            />
                                        )}
                                        />
                                    </Link>
                                </ListItem>
                            </List>
                        </HelpBase>
                    </Grid>

                </Grid>
            </Toolbar>
            <main className={classes.main}>
                <Paper className={classes.paperUpload}>
                    <Grid item xs className={classes.uploadFilesHeading}>
                        <Typography color='inherit' variant='h5' component='h1'>
                            <FormattedMessage
                                id='TenantTheme.Upload.Theme.upload.files'
                                defaultMessage='Upload/Download Theme'
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs className={classes.uploadFilesHeading}>
                        <Typography component='p' className={classes.content}>
                            <FormattedMessage
                                id='TenantTheme.Upload.Theme.info.message'
                                defaultMessage={'The theme should be a zip file containing CSS'
                                    + ' and images compliant with the '}
                            />
                            <Link
                                target='_blank'
                                href={Configurations.app.docUrl
                                    + 'reference/customize-product/customizations/customizing-the-developer-portal/'
                                    + 'overriding-developer-portal-theme/#tenant-theming'}
                                underline='hover'
                            >
                                {' '}
                                <FormattedMessage
                                    id='TenantTheme.Upload.Theme.info.message.link'
                                    defaultMessage='API Manager theme format'
                                />
                            </Link>
                        </Typography>
                    </Grid>
                    {fileName && (
                        <Grid className={classes.uploadFilesHeading}>
                            <Box boxShadow={2} p={1} className={classes.downloadBox}>
                                <Icon style={{ fontSize: 40 }}>file_copy</Icon>
                                <Typography color='inherit' variant='h6' className={classes.fileName}>
                                    {fileName}
                                </Typography>
                                <Button size='small' className={classes.button} onClick={handleDownloadTenantTheme}>
                                    <Icon style={{ fontSize: 40 }}>arrow_downward</Icon>
                                </Button>
                            </Box>
                        </Grid>
                    )}
                    {isUploadUnsuccessful && (
                        <AlertMui severity='warning' className={classes.fileUploadError}>
                            <FormattedMessage
                                id='TenantTheme.Upload.Theme.warning.message'
                                defaultMessage='Zip file contains unsupported files. Upload only supported files.'
                            />
                        </AlertMui>
                    )}
                    <Grid className={classes.dropbox}>
                        {(themeFile && themeFile.name) ? (
                            <List>
                                <ListItem key={themeFile && themeFile.path}>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <InsertDriveFile />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${themeFile && themeFile.path} - 
                                    ${humanFileSize(themeFile && themeFile.size)}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge='end'
                                            aria-label='delete'
                                            onClick={() => {
                                                setThemeFile(null);
                                                setIsFileAccepted(false);
                                            }}
                                            size='large'
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        ) : (
                            <DropZoneLocal
                                error={isFileAccepted}
                                onDrop={onDrop}
                                files={themeFile && themeFile.name}
                                accept='.zip'
                            >
                                <FormattedMessage
                                    id='TenantTheme.Upload.Theme.drag.and.drop.message'
                                    defaultMessage='Drag & Drop files here {break} or {break}'
                                    values={{ break: <br /> }}
                                />
                                <Button
                                    color='primary'
                                    variant='contained'
                                    className={classes.browseFileButton}
                                >
                                    <FormattedMessage
                                        id='TenantTheme.Upload.Theme.browse.files.to.upload'
                                        defaultMessage='Browse File to Upload'
                                    />
                                </Button>
                            </DropZoneLocal>
                        )}
                    </Grid>
                    <Grid className={classes.uploadButtonGrid}>
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={uploadThemeFile}
                            disabled={!isFileAccepted}
                        >
                            <FormattedMessage
                                id='TenantTheme.Upload.Theme.button.upload'
                                defaultMessage='Upload'
                            />
                        </Button>
                    </Grid>
                </Paper>
            </main>
        </Root>
    );
}

UploadTheme.propTypes = {
    triggerButtonText: PropTypes.shape({}).isRequired,
    title: PropTypes.shape({}).isRequired,
    pageProps: PropTypes.shape({}).isRequired,
};

export default UploadTheme;
