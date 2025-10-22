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
import React, { useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
export default function SpecErrors(props) {
    const { specErrors } = props;
    const [open, setOpen] = useState(false);
    if (!specErrors || specErrors.length === 0) {
        return null;
    }
    return <>
        <sup>
            <Tooltip title='Show errors'>
                <IconButton
                    onClick={() => setOpen(true)}
                    color='secondary'
                    aria-label='Errors in spec'
                    size='large'>
                    <ErrorOutlineIcon color='error' />
                </IconButton>
            </Tooltip>
        </sup>
        <Dialog maxWidth='md' aria-labelledby='confirmation-dialog-title' open={open}>
            <DialogTitle id='confirmation-dialog-title'>
                <Typography display='inline' color='textPrimary' variant='h6'>
                    Errors
                    <Typography display='inline' variant='subtitle2'>
                        {' '}
                        in OpenAPI definition
                    </Typography>
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <List>
                    {specErrors.map((error, index) => (
                        <span key={error.description}>
                            {index % 2 !== 0 && <Divider variant='inset' />}
                            <ListItem>
                                <ListItemText
                                    primary={error.message}
                                    primaryTypographyProps={{
                                        color: 'error',
                                    }}
                                    inset
                                />
                            </ListItem>
                            <Box boxShadow={1} py={5} pr={5} border={1} borderColor='grey.500'>
                                <pre>
                                    <code>
                                        {error.description}
                                    </code>
                                </pre>
                            </Box>
                        </span>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} color='primary'>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    </>;
}

SpecErrors.propTypes = {
    specErrors: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
