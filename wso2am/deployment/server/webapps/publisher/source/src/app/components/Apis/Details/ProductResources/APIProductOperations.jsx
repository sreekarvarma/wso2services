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
import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { FormattedMessage } from 'react-intl';
import EditIcon from '@mui/icons-material/Edit';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Box from '@mui/material/Box';
import API from 'AppData/api';
import { isRestricted } from 'AppData/AuthManager';

import Resources from 'AppComponents/Apis/Details/Resources/Resources';
import APIRateLimiting from '../Resources/components/APIRateLimiting';

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function APIProductOperations() {
    const [api, updateAPI] = useAPI();
    const [apiThrottlingPolicy, setApiThrottlingPolicy] = useState(api.apiThrottlingPolicy);
    const [operationRateLimits, setOperationRateLimits] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        // Fetch API level throttling policies only when the page get mounted for the first time `componentDidMount`
        API.policies('api').then((response) => {
            setOperationRateLimits(response.body.list);
        });
        // TODO: need to handle the error cases through catch ~tmkb
    }, []);

    useEffect(() => {
        setApiThrottlingPolicy(api.apiThrottlingPolicy);
    }, [api.apiThrottlingPolicy]);

    /**
     *
     *
     */
    function saveChanges() {
        setIsSaving(true);
        updateAPI({ apiThrottlingPolicy }).finally(() => setIsSaving(false));
    }
    return (
        <Grid container spacing={4}>
            <Grid item md={12}>
                <Typography variant='h4' gutterBottom>
                    <FormattedMessage
                        id='Apis.Details.Resources.Resources.edit.resources.title'
                        defaultMessage='Product Resources'
                    />
                </Typography>
                <Box component='div' display='inline'>
                    <Link to={'/api-products/' + api.id + '/resources/edit'}>
                        <Button
                            variant='contained'
                            color='primary'
                            disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        >
                            <EditIcon />
                            <FormattedMessage
                                id='Apis.Details.Resources.Resources.edit.resources.button'
                                defaultMessage='Edit Resources'
                            />
                        </Button>
                    </Link>
                </Box>
            </Grid>
            <Grid item md={12}>
                <APIRateLimiting
                    operationRateLimits={operationRateLimits}
                    api={api}
                    isAPIProduct
                    value={apiThrottlingPolicy}
                    onChange={setApiThrottlingPolicy}
                />
            </Grid>
            {!isRestricted(['apim:api_create'], api) && (
                <Grid item md={12}>
                    <Box ml={1}>
                        <Button
                            onClick={saveChanges}
                            disabled={api.isRevision}
                            variant='contained'
                            size='small'
                            color='primary'
                        >
                            <FormattedMessage
                                id='Apis.Details.Resources.Resources.resources.save.button'
                                defaultMessage='Save'
                            />
                            {isSaving && <CircularProgress size={24} />}
                        </Button>
                        <Box display='inline' ml={1}>
                            <Button
                                size='small'
                                variant='outlined'
                                onClick={() => setApiThrottlingPolicy(api.apiThrottlingPolicy)}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Resources.Resources.resources.reset.button'
                                    defaultMessage='Reset'
                                />
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            )}

            <Grid item md={12}>
                <Resources
                    hideAPIDefinitionLink
                    disableUpdate
                    disableRateLimiting
                    operationProps={{ disableDelete: true }}
                    disableMultiSelect
                    disableAddOperation
                />
            </Grid>
        </Grid>
    );
}
