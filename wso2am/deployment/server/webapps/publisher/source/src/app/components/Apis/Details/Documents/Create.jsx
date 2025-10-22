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

import React, { useRef, useContext, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Alert from 'AppComponents/Shared/Alert';
import Api from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import CreateEditForm from './CreateEditForm';
import APIContext from 'AppComponents/Apis/Details/components/ApiContext';
import GoToEdit from './GoToEdit';

const PREFIX = 'Create';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    addNewWrapper: `${PREFIX}-addNewWrapper`,
    addNewHeader: `${PREFIX}-addNewHeader`,
    addNewOther: `${PREFIX}-addNewOther`,
    button: `${PREFIX}-button`,
    mainTitle: `${PREFIX}-mainTitle`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.titleLink}`]: {
        color: theme.palette.primary.main,
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.addNewWrapper}`]: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px ' + theme.palette.grey['300'],
        borderRadius: theme.shape.borderRadius,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.addNewHeader}`]: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey['300'],
        fontSize: theme.typography.h6.fontSize,
        color: theme.typography.h6.color,
        fontWeight: theme.typography.h6.fontWeight,
    },

    [`& .${classes.addNewOther}`]: {
        padding: theme.spacing(2),
    },

    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },

    [`& .${classes.mainTitle}`]: {
        color: theme.palette.primary.dark,
    }
}));

function Create(props) {
    const { api, isAPIProduct } = useContext(APIContext);
    const [newDoc, setNewDoc] = useState(null);
    const [saveDisabled, setSaveDisabled] = useState(true);
    const {  intl, history } = props;
    const urlPrefix = isAPIProduct ? 'api-products' : 'apis';
    const listingPath = `/${urlPrefix}/${api.id}/documents`;
    const restAPI = api.apiType === Api.CONSTS.APIProduct ? new APIProduct() : new Api();
    let createEditForm = useRef(null);

    const addDocument = (apiId) => {
        const promiseWrapper = createEditForm.current.addDocument(apiId);
        promiseWrapper.docPromise
            .then((doc) => {
                const { documentId, name } = doc.body;
                if (promiseWrapper.file && documentId) {
                    const filePromise = restAPI.addFileToDocument(apiId, documentId, promiseWrapper.file[0]);
                    filePromise
                        .then((doc) => {
                            Alert.info(`${name} ${intl.formatMessage({
                                id: 'Apis.Details.Documents.Create.successful.file.upload.message',
                                defaultMessage: 'File uploaded successfully.',
                            })}`);
                            history.push(listingPath);
                        })
                        .catch((error) => {
                            if (process.env.NODE_ENV !== 'production') {
                                console.log(error);
                                Alert.error(intl.formatMessage({
                                    id: 'Apis.Details.Documents.Create.markdown.editor.upload.error',
                                    defaultMessage: 'Error uploading the file',
                                }));
                            }
                        });
                } else {
                    Alert.info(`${doc.body.name} ${intl.formatMessage({
                        id: 'Apis.Details.Documents.Create.markdown.editor.success',
                        defaultMessage: ' added successfully.',
                    })}`);
                    setNewDoc(doc);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Documents.Create.markdown.editor.add.error',
                        defaultMessage: 'Error adding the document',
                    }));
                }
            });
    };
    return (
        <Root>
            <Grid container spacing={3}>
                <Grid item sm={12} md={12} />
                {/*
            Following two grids control the placement of whole create page
            For centering the content better use `container` props, but instead used an empty grid item for flexibility
             */}
                <Grid item sm={0} md={0} lg={2} />
                <Grid item sm={12} md={12} lg={8}>
                    <Grid container spacing={5}>
                        <Grid item md={12}>
                            <div className={classes.titleWrapper}>
                                <Link to={listingPath} className={classes.titleLink}>
                                    <Typography variant='h5' component='h2' align='left' className={classes.mainTitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Documents.Create.heading'
                                            defaultMessage='Documents'
                                        />
                                    </Typography>
                                </Link>
                                <Icon>keyboard_arrow_right</Icon>
                                <Typography variant='h5' component='h3'>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.Create.title'
                                        defaultMessage='Add New Document'
                                    />
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item md={12}>
                            <Paper elevation={0}>
                                <CreateEditForm
                                    ref={createEditForm}
                                    apiType={api.apiType}
                                    apiId={api.id}
                                    saveDisabled={saveDisabled}
                                    setSaveDisabled={setSaveDisabled}
                                />
                                <Divider />

                                <div className={classes.addNewOther}>
                                    <Button
                                        id='add-document-btn'
                                        data-testid='add-document-btn'
                                        variant='contained'
                                        color='primary'
                                        onClick={() => addDocument(api.id)}
                                        disabled={saveDisabled}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Documents.Create.markdown.editor.add.document.button'
                                            defaultMessage='Add Document'
                                        />
                                    </Button>
                                    <Button className={classes.button} onClick={() => history.push(listingPath)}>
                                        <FormattedMessage
                                            id='Apis.Details.Documents.Create.markdown.editor.add.document.cancel.button'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {newDoc && <GoToEdit doc={newDoc} />}
        </Root>
    );
}

Create.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.func.isRequired,
    apiType: PropTypes.oneOf([Api.CONSTS.API, Api.CONSTS.APIProduct]).isRequired,
};

export default injectIntl(withRouter((Create)));
