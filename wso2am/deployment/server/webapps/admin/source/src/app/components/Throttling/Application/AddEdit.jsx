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

import React, { useReducer, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import DialogContentText from '@mui/material/DialogContentText';
import { FormattedMessage, useIntl } from 'react-intl';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import {
    Typography, RadioGroup, Radio, FormControlLabel, FormControl, Grid, Select, MenuItem,
} from '@mui/material';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Joi from '@hapi/joi';

const styles = {
    quotaHeading: {
        marginTop: 3,
        marginBottom: 2,
    },
    unitTime: {
        display: 'flex',
        minWidth: 60,
    },
    unitTimeSelection: {
        marginTop: 1,
        marginLeft: 2,
        minWidth: 140,
    },
};

/**
 * Reducer
 * @param {JSON} state The second number.
 * @returns {Promise}
 */
function reducer(state, { field, value }) {
    switch (field) {
        case 'policyName':
            return { ...state, [field]: value };
        case 'description':
            return { ...state, [field]: value };
        case 'requestCount':
            return {
                ...state,
                defaultLimit: { ...state.defaultLimit, [field]: value },
            };
        case 'timeUnit':
            return {
                ...state,
                defaultLimit: { ...state.defaultLimit, [field]: value },
            };
        case 'unitTime':
            return {
                ...state,
                defaultLimit: { ...state.defaultLimit, [field]: value },
            };
        case 'type':
            return {
                ...state,
                defaultLimit: { ...state.defaultLimit, [field]: value },
            };
        case 'dataAmount':
            return {
                ...state,
                defaultLimit: { ...state.defaultLimit, [field]: value },
            };
        case 'dataUnit':
            return {
                ...state,
                defaultLimit: { ...state.defaultLimit, [field]: value },
            };
        case 'editDetails':
            return value;
        case 'rateLimitCount':
            return {
                ...state,
                burstLimit: { ...state.burstLimit, [field]: value },
            };
        case 'rateLimitTimeUnit':
            return {
                ...state,
                burstLimit: { ...state.burstLimit, [field]: value },
            };
        default:
            return state;
    }
}

/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 */
function AddEdit(props) {
    const intl = useIntl();
    const {
        updateList, icon, triggerButtonText, title, dataRow,
    } = props;

    const [initialState, setInitialState] = useState({
        policyName: '',
        description: '',
        defaultLimit: {
            requestCount: '',
            timeUnit: 'min',
            unitTime: '',
            type: 'REQUESTCOUNTLIMIT',
            dataAmount: '',
            dataUnit: 'KB',
        },
        burstLimit: {
            rateLimitCount: '',
            rateLimitTimeUnit: 'sec',
        },
    });

    const [state, dispatch] = useReducer(reducer, initialState);
    const {
        policyName, description, defaultLimit: {
            requestCount, timeUnit, unitTime, type, dataAmount, dataUnit,
        },
        burstLimit: {
            rateLimitCount, rateLimitTimeUnit,
        },
    } = state;
    const [validationError, setValidationError] = useState([]);
    const [editMode, setIsEditMode] = useState(false);
    const restApi = new API();

    useEffect(() => {
        setInitialState({
            policyName: '',
            description: '',
            defaultLimit: {
                requestCount: '',
                timeUnit: 'min',
                unitTime: '',
                type: 'REQUESTCOUNTLIMIT',
                dataAmount: '',
                dataUnit: 'KB',
            },
            burstLimit: {
                rateLimitCount: '',
                rateLimitTimeUnit: 'sec',
            },
        });
    }, []);

    const validate = (fieldName, value) => {
        let error = '';
        const schema = Joi.string().regex(/^[^~!@#;:%^*()+={}|\\<>"',&$\s+]*$/);
        switch (fieldName) {
            case 'policyName':
                if (value === '') {
                    error = intl.formatMessage({
                        id: 'Throttling.Application.Policy.policy.name.empty',
                        defaultMessage: 'Name is Empty',
                    });
                } else if (value.indexOf(' ') !== -1) {
                    error = intl.formatMessage({
                        id: 'Throttling.Application.Policy.policy.name.space',
                        defaultMessage: 'Name contains spaces',
                    });
                } else if (value.length > 60) {
                    error = intl.formatMessage({
                        id: 'Throttling.Application.Policy.policy.name.too.long',
                        defaultMessage: 'Application policy name is too long',
                    });
                } else if (schema.validate(value).error) {
                    error = intl.formatMessage({
                        id: 'Throttling.Application.Policy.policy.name.invalid.character',
                        defaultMessage: 'Name contains one or more illegal characters',
                    });
                } else {
                    error = '';
                }
                setValidationError({ policyName: error });
                break;
            case 'requestCount':
                error = value === '' ? intl.formatMessage({
                    id: 'Throttling.Application.Policy.policy.request.count.empty',
                    defaultMessage: 'Request Count is Empty',
                }) : '';
                setValidationError({ requestCount: error });
                break;
            case 'dataAmount':
                error = value === '' ? intl.formatMessage({
                    id: 'Throttling.Application.Policy.policy.data.amount.empty',
                    defaultMessage: 'Data Amount is Empty',
                }) : '';
                setValidationError({ dataAmount: error });
                break;
            case 'unitTime':
                if (value === '') {
                    error = intl.formatMessage({
                        id: 'Throttling.Application.Policy.policy.unit.time.empty',
                        defaultMessage: 'Unit Time is Empty',
                    });
                } else if (parseInt(value, 10) <= 0) {
                    error = intl.formatMessage({
                        id: 'Throttling.Application.Policy.policy.unit.time.negative',
                        defaultMessage: 'Invalid Time Value',
                    });
                } else {
                    error = '';
                }
                setValidationError({ unitTime: error });
                break;
            default:
                break;
        }
        return error;
    };

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    const getAllFormErrors = () => {
        let errorText = '';
        const policyNameErrors = validate('policyName', policyName);
        const requestCountErrors = validate('requestCount', requestCount);
        const dataAmounttErrors = validate('dataAmount', dataAmount);
        const unitTimeErrors = validate('unitTime', unitTime);

        if (type === 'BANDWIDTHLIMIT') {
            errorText += policyNameErrors + dataAmounttErrors + unitTimeErrors;
        } else {
            errorText += policyNameErrors + requestCountErrors + unitTimeErrors;
        }
        return errorText;
    };

    const formSaveCallback = () => {
        const formErrors = getAllFormErrors();
        if (formErrors !== '') {
            Alert.error(formErrors);
            return (false);
        }
        let applicationThrottlingPolicy;
        let promisedAddApplicationPolicy;

        if (type === 'REQUESTCOUNTLIMIT') {
            applicationThrottlingPolicy = {
                policyName: state.policyName,
                description: state.description,
                defaultLimit: {
                    type: state.defaultLimit.type,
                    requestCount: {
                        requestCount: state.defaultLimit.requestCount,
                        timeUnit: state.defaultLimit.timeUnit,
                        unitTime: state.defaultLimit.unitTime,
                    },
                },
                burstLimit: {
                    rateLimitCount: state.burstLimit.rateLimitCount,
                    rateLimitTimeUnit: state.burstLimit.rateLimitTimeUnit,
                },
            };
        } else {
            applicationThrottlingPolicy = {
                policyName: state.policyName,
                description: state.description,
                defaultLimit: {
                    type: state.defaultLimit.type,
                    bandwidth: {
                        dataAmount: state.defaultLimit.dataAmount,
                        dataUnit: state.defaultLimit.dataUnit,
                        timeUnit: state.defaultLimit.timeUnit,
                        unitTime: state.defaultLimit.unitTime,
                    },
                },
                burstLimit: {
                    rateLimitCount: state.burstLimit.rateLimitCount,
                    rateLimitTimeUnit: state.burstLimit.rateLimitTimeUnit,
                },
            };
        }

        if (!applicationThrottlingPolicy.burstLimit.rateLimitCount) {
            applicationThrottlingPolicy.burstLimit = null;
        }

        if (dataRow) {
            const policyId = dataRow[4];
            promisedAddApplicationPolicy = restApi.updateApplicationThrottlingPolicy(policyId,
                applicationThrottlingPolicy);
            return promisedAddApplicationPolicy
                .then(() => {
                    return (
                        intl.formatMessage({
                            id: 'Throttling.Application.Policy.policy.edit.success',
                            defaultMessage: 'Application Rate Limiting Policy edited successfully.',
                        })
                    );
                })
                .catch((error) => {
                    const { response } = error;
                    if (response.body) {
                        throw (response.body.description);
                    }
                    return null;
                })
                .finally(() => {
                    updateList();
                });
        } else {
            promisedAddApplicationPolicy = restApi.addApplicationThrottlingPolicy(
                applicationThrottlingPolicy,
            );
            return promisedAddApplicationPolicy
                .then(() => {
                    return (
                        intl.formatMessage({
                            id: 'Throttling.Application.Policy.policy.add.success',
                            defaultMessage: 'Application Rate Limiting Policy added successfully.',
                        })
                    );
                })
                .catch((error) => {
                    const { response } = error;
                    if (response.body) {
                        throw (response.body.description);
                    }
                    return null;
                })
                .finally(() => {
                    updateList();
                });
        }
    };

    const dialogOpenCallback = () => {
        if (dataRow) {
            setIsEditMode(true);
            const policyId = dataRow[4];
            let editState;
            restApi.applicationThrottlingPolicyGet(policyId).then((result) => {
                if (result.body.defaultLimit.requestCount !== null) {
                    editState = {
                        policyName: result.body.policyName,
                        description: result.body.description,
                        defaultLimit: {
                            requestCount: result.body.defaultLimit.requestCount.requestCount,
                            timeUnit: result.body.defaultLimit.requestCount.timeUnit,
                            unitTime: result.body.defaultLimit.requestCount.unitTime,
                            type: result.body.defaultLimit.type,
                            dataAmount: '',
                            dataUnit: 'KB',
                        },
                        burstLimit: {
                            rateLimitCount: result.body.burstLimit.rateLimitCount,
                            rateLimitTimeUnit: (result.body.burstLimit.rateLimitCount === 0) ? 'sec'
                                : result.body.burstLimit.rateLimitTimeUnit,
                        },
                    };
                } else {
                    editState = {
                        policyName: result.body.policyName,
                        description: result.body.description,
                        defaultLimit: {
                            requestCount: '',
                            timeUnit: result.body.defaultLimit.bandwidth.timeUnit,
                            unitTime: result.body.defaultLimit.bandwidth.unitTime,
                            type: result.body.defaultLimit.type,
                            dataAmount: result.body.defaultLimit.bandwidth.dataAmount,
                            dataUnit: result.body.defaultLimit.bandwidth.dataUnit,
                        },
                        burstLimit: {
                            rateLimitCount: result.body.burstLimit.rateLimitCount,
                            rateLimitTimeUnit: (result.body.burstLimit.rateLimitCount === 0) ? 'sec'
                                : result.body.burstLimit.rateLimitTimeUnit,
                        },
                    };
                }
                dispatch({ field: 'editDetails', value: editState });
            });
        }
    };

    return (
        <FormDialogBase
            title={title}
            saveButtonText={intl.formatMessage({
                id: 'Admin.Throttling.Application.Throttling.Policy.add.save.btn',
                defaultMessage: 'Save',
            })}
            icon={icon}
            triggerButtonText={triggerButtonText}
            formSaveCallback={formSaveCallback}
            dialogOpenCallback={dialogOpenCallback}
        >
            <DialogContentText>
                <Typography variant='h6'>
                    <FormattedMessage
                        id='Admin.Throttling.Application.Throttling.Policy.add.general.details'
                        defaultMessage='General Details'
                    />
                </Typography>
            </DialogContentText>
            <TextField
                autoFocus
                margin='dense'
                name='policyName'
                label={(
                    <FormattedMessage
                        id='Admin.Throttling.Application.Throttling.Policy.form.policyName'
                        defaultMessage='Name'
                    />
                )}
                fullWidth
                required
                variant='outlined'
                value={policyName}
                disabled={editMode}
                onChange={onChange}
                InputProps={{
                    id: 'policyName',
                    onBlur: ({ target: { value } }) => {
                        validate('policyName', value);
                    },
                }}
                error={validationError.policyName}
                helperText={validationError.policyName ? validationError.policyName
                    : (
                        <FormattedMessage
                            id='Admin.Throttling.Application.Throttling.Policy.add.name.helper.text'
                            defaultMessage='Name of the throttle policy'
                        />
                    )}
            />
            <TextField
                margin='dense'
                name='description'
                label={(
                    <FormattedMessage
                        id='Admin.Throttling.Application.Throttling.Policy.form.description'
                        defaultMessage='Description'
                    />
                )}
                fullWidth
                variant='outlined'
                helperText={(
                    <FormattedMessage
                        id='Admin.Throttling.Application.Throttling.Policy.add.description.helper.text'
                        defaultMessage='Description of the throttle policy'
                    />
                )}
                value={description}
                onChange={onChange}
            />
            <DialogContentText>
                <Typography variant='h6' sx={styles.quotaHeading}>
                    <FormattedMessage
                        id='Admin.Throttling.Application.Throttling.Policy.add.quota.limits.details'
                        defaultMessage='Quota Limits'
                    />
                </Typography>
            </DialogContentText>
            <FormControl variant='outlined' component='fieldset'>
                <RadioGroup
                    row
                    aria-label='position'
                    defaultValue='top'
                    name='type'
                    onChange={onChange}
                    value={type}
                >
                    <FormControlLabel
                        value='REQUESTCOUNTLIMIT'
                        control={<Radio color='primary' />}
                        label={(
                            <FormattedMessage
                                id='Admin.Throttling.Application.Throttling.Policy.option.request.count.label'
                                defaultMessage='Request Count '
                            />
                        )}
                        labelPlacement='end'
                    />
                    <FormControlLabel
                        value='BANDWIDTHLIMIT'
                        control={<Radio color='primary' />}
                        label={(
                            <FormattedMessage
                                id='Admin.Throttling.Application.Throttling.Policy.option.request.bandwidth.label'
                                defaultMessage='Request Bandwidth'
                            />
                        )}
                        labelPlacement='end'
                    />
                </RadioGroup>
                {type === 'REQUESTCOUNTLIMIT' ? (
                    <TextField
                        margin='dense'
                        name='requestCount'
                        label={(
                            <FormattedMessage
                                id='Admin.Throttling.Application.Throttling.Policy.option.request.count.label'
                                defaultMessage='Request Count'
                            />
                        )}
                        fullWidth
                        value={requestCount}
                        type='number'
                        onChange={onChange}
                        variant='outlined'
                        required
                        InputProps={{
                            id: 'requestCount',
                            onBlur: ({ target: { value } }) => {
                                validate('requestCount', value);
                            },
                        }}
                        error={validationError.requestCount}
                        helperText={validationError.requestCount ? validationError.requestCount
                            : (
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.request.count.helper.text'
                                    defaultMessage='Number of requests allowed'
                                />
                            )}
                    />
                ) : (
                    <Grid sx={styles.unitTime}>
                        <TextField
                            margin='dense'
                            name='dataAmount'
                            label={(
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.option.data.bandwidth.label'
                                    defaultMessage='Data Bandwith'
                                />
                            )}
                            fullWidth
                            required
                            type='number'
                            variant='outlined'
                            value={dataAmount}
                            onChange={onChange}
                            InputProps={{
                                id: 'dataAmount',
                                onBlur: ({ target: { value } }) => {
                                    validate('dataAmount', value);
                                },
                            }}
                            error={validationError.dataAmount}
                            helperText={validationError.dataAmount ? validationError.dataAmount
                                : (
                                    <FormattedMessage
                                        id='Admin.Throttling.Application.Throttling.Policy.add.data.amount.helper.text'
                                        defaultMessage='Bandwidth allowed'
                                    />
                                )}
                        />
                        <FormControl variant='outlined' sx={styles.unitTimeSelection}>
                            <Select
                                variant='outlined'
                                labelId='demo-simple-select-label'
                                name='dataUnit'
                                value={dataUnit}
                                onChange={onChange}
                            >
                                <MenuItem value='KB'>KB</MenuItem>
                                <MenuItem value='MB'>MB</MenuItem>
                            </Select>
                        </FormControl>

                    </Grid>

                )}
                <Grid sx={styles.unitTime}>
                    <TextField
                        margin='dense'
                        name='unitTime'
                        label={(
                            <FormattedMessage
                                id='Admin.Throttling.Application.Throttling.Policy.option.request.unit.time.label'
                                defaultMessage='Unit Time'
                            />
                        )}
                        type='number'
                        fullWidth
                        variant='outlined'
                        value={unitTime}
                        onChange={onChange}
                        InputProps={{
                            id: 'unitTime',
                            onBlur: ({ target: { value } }) => {
                                validate('unitTime', value);
                            },
                        }}
                        error={validationError.unitTime}
                        helperText={validationError.unitTime ? validationError.unitTime
                            : (
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.helper.text'
                                    defaultMessage='Time configuration'
                                />
                            )}
                    />
                    <FormControl variant='outlined' sx={styles.unitTimeSelection}>
                        <Select
                            variant='outlined'
                            labelId='demo-simple-select-label'
                            name='timeUnit'
                            value={timeUnit}
                            onChange={onChange}
                            fullWidth
                        >
                            <MenuItem value='min'>
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.minutes'
                                    defaultMessage='Minute(s)'
                                />
                            </MenuItem>
                            <MenuItem value='hour'>
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.hours'
                                    defaultMessage='Hour(s)'
                                />
                            </MenuItem>
                            <MenuItem value='day'>
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.days'
                                    defaultMessage='Day(s)'
                                />
                            </MenuItem>
                            <MenuItem value='week'>
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.weeks'
                                    defaultMessage='Week(s)'
                                />
                            </MenuItem>
                            <MenuItem value='month'>
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.months'
                                    defaultMessage='Month(s)'
                                />
                            </MenuItem>
                            <MenuItem value='year'>
                                <FormattedMessage
                                    id='Admin.Throttling.Application.Throttling.Policy.add.time.years'
                                    defaultMessage='Year(s)'
                                />
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </FormControl>
            {/* Burst Control (Rate Limiting) */}
            <DialogContentText>
                <Typography variant='h6' sx={styles.quotaHeading}>
                    <FormattedMessage
                        id='Admin.Throttling.Application.Throttling.Policy.add.burst.limits.details'
                        defaultMessage='Burst Control (Rate Limiting)'
                    />
                </Typography>
                <Typography color='inherit' variant='caption' component='p'>
                    <FormattedMessage
                        id='Admin.Throttling.Application.AddEdit.burst.control.add.description'
                        defaultMessage='Define Burst Control Limits (optional)'
                    />
                </Typography>
            </DialogContentText>
            <Grid sx={styles.unitTime}>
                <TextField
                    margin='dense'
                    name='rateLimitCount'
                    value={rateLimitCount}
                    type='number'
                    onChange={onChange}
                    label={(
                        <FormattedMessage
                            id='Throttling.Application.AddEdit.form.request.rate'
                            defaultMessage='Request Rate'
                        />
                    )}
                    fullWidth
                    helperText={intl.formatMessage({
                        id: 'Throttling.Application.AddEdit.burst.control.limit',
                        defaultMessage: 'Number of requests for burst control',
                    })}
                    variant='outlined'
                />
                <FormControl variant='outlined' sx={styles.unitTimeSelection}>
                    <Select
                        variant='outlined'
                        name='rateLimitTimeUnit'
                        value={rateLimitTimeUnit}
                        fullWidth
                        onChange={onChange}
                    >
                        <MenuItem value='sec'>
                            <FormattedMessage
                                id='Throttling.Application.AddEdit.burst.rate.limit.seconds'
                                defaultMessage='Requests/sec'
                            />
                        </MenuItem>
                        <MenuItem value='min'>
                            <FormattedMessage
                                id='Throttling.Application.AddEdit.burst.rate.limit.min'
                                defaultMessage='Requests/min'
                            />
                        </MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </FormDialogBase>
    );
}

AddEdit.defaultProps = {
    icon: null,
    dataRow: null,
};

AddEdit.propTypes = {
    updateList: PropTypes.func.isRequired,
    dataRow: PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    }),
    icon: PropTypes.element,
    triggerButtonText: PropTypes.shape({}).isRequired,
    title: PropTypes.shape({}).isRequired,
};

export default AddEdit;
