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

import React from 'react';
import { FormattedMessage } from 'react-intl';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 *
 *
 * @param {*} props
 * @returns
 */
function ListAddOns(props) {
    const {
        searchActive, filterData, onRefresh, searchPlaceholder, children, searchValue,
    } = props;

    return (
        <AppBar
            sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
            position='static'
            color='default'
            elevation={0}
        >
            <Toolbar>
                <Grid container spacing={2} direction='row' justifyContent='flex-end' alignItems='center'>
                    <Grid item>
                        {searchActive && (<SearchIcon sx={{ display: 'block' }} color='inherit' />)}
                    </Grid>
                    <Grid item xs>
                        {searchActive && (
                            <TextField
                                variant='standard'
                                fullWidth
                                placeholder={searchPlaceholder}
                                InputProps={{
                                    disableUnderline: true,
                                    style: { fontSize: '12px' },
                                }}
                                value={searchValue}
                                onChange={filterData}
                            />
                        )}
                    </Grid>
                    {children}
                    <Grid item>
                        <Tooltip title={(
                            <FormattedMessage
                                id='AdminPages.Addons.ListBase.reload'
                                defaultMessage='Reload'
                            />
                        )}
                        >
                            <IconButton onClick={onRefresh} size='large'>
                                <RefreshIcon
                                    sx={{ display: 'block' }}
                                    color='inherit'
                                    aria-label='refresh-button-icon'
                                />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    );
}

export default ListAddOns;
