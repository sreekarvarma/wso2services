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

import React, { useReducer, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import API from 'AppData/api';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { FormattedMessage, useIntl } from 'react-intl';
import FormDialogBase from 'AppComponents/AdminPages/Addons/FormDialogBase';
import Alert from 'AppComponents/Shared/Alert';

const StyledSpan = styled('span')(({ theme }) => ({ color: theme.palette.error.dark }));

/**
 * Reducer
 * @param {JSON} state State
 * @returns {Promise}.
 */
function reducer(state, { field, value }) {
    switch (field) {
        case 'name':
        case 'description':
            return { ...state, [field]: value };
        case 'editDetails':
            return value;
        default:
            return state;
    }
}

/**
 * Render a pop-up dialog to add/edit an API category
 * @param {JSON} props .
 * @returns {JSX}.
 */
function AddEdit(props) {
    const {
        updateList, dataRow, icon, triggerButtonText, title,
    } = props;
    const intl = useIntl();
    const [initialState, setInitialState] = useState({
        description: '',
    });
    const [editMode, setIsEditMode] = useState(false);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { name, description } = state;

    const onChange = (e) => {
        dispatch({ field: e.target.name, value: e.target.value });
    };

    useEffect(() => {
        setInitialState({
            description: '',
        });
    }, []);

    const hasErrors = (fieldName, value) => {
        let error;
        switch (fieldName) {
            case 'name':
                if (value === undefined) {
                    error = false;
                    break;
                }
                if (value === '') {
                    error = intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.error.name.empty',
                        defaultMessage: 'Name is Empty',
                    });
                } else if (value.length > 255) {
                    error = intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.error.name.too.long',
                        defaultMessage: 'API Category name is too long',
                    });
                } else if (/\s/.test(value)) {
                    error = intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.error.name.has.spaces',
                        defaultMessage: 'Name contains spaces',
                    });
                } else if (/[!@#$%^&*(),?"{}[\]|<>\t\n]/i.test(value)) {
                    error = intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.error.name.has.special.chars',
                        defaultMessage: 'Name field contains special characters',
                    });
                } else {
                    error = false;
                }
                break;
            case 'description':
                if (value && value.length > 1024) {
                    error = intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.error.description.too.long',
                        defaultMessage: 'API Category description is too long',
                    });
                }
                break;
            default:
                break;
        }
        return error;
    };
    const getAllFormErrors = () => {
        let errorText = '';
        let NameErrors;
        let DescriptionErrors;
        if (name === undefined) {
            dispatch({ field: 'name', value: '' });
            NameErrors = hasErrors('name', '');
        } else {
            NameErrors = hasErrors('name', name);
        }
        if (NameErrors) {
            errorText += NameErrors + '\n';
        }
        if (description !== undefined) {
            DescriptionErrors = hasErrors('description', description);
        }
        if (DescriptionErrors) {
            errorText += DescriptionErrors + '\n';
        }
        return errorText;
    };
    const formSaveCallback = () => {
        const formErrors = getAllFormErrors();
        if (formErrors !== '') {
            Alert.error(formErrors);
            return false;
        }
        const restApi = new API();
        let promiseAPICall;
        if (dataRow) {
            // assign the update promise to the promiseAPICall
            promiseAPICall = restApi.updateAPICategory(dataRow.id, name, description);
        } else {
            // assign the create promise to the promiseAPICall
            promiseAPICall = restApi.createAPICategory(name, description);
        }

        return promiseAPICall
            .then(() => {
                if (dataRow) {
                    return (
                        intl.formatMessage({
                            id: 'AdminPages.ApiCategories.AddEdit.form.edit.successful',
                            defaultMessage: 'API Category edited successfully',
                        })
                    );
                } else {
                    return (
                        intl.formatMessage({
                            id: 'AdminPages.ApiCategories.AddEdit.form.add.successful',
                            defaultMessage: 'API Category added successfully',
                        })
                    );
                }
            })
            .catch((error) => {
                const { response } = error;
                if (response.body) {
                    throw response.body.description;
                }
            })
            .finally(() => {
                updateList();
            });
    };
    const dialogOpenCallback = () => {
        if (dataRow) {
            const { name: originalName, description: originalDescription } = dataRow;
            setIsEditMode(true);
            dispatch({ field: 'editDetails', value: { name: originalName, description: originalDescription } });
        }
    };
    return (
        <FormDialogBase
            title={title}
            saveButtonText={intl.formatMessage({
                id: 'AdminPages.ApiCategories.AddEdit.form.save.btn',
                defaultMessage: 'Save',
            })}
            icon={icon}
            triggerButtonText={triggerButtonText}
            formSaveCallback={formSaveCallback}
            dialogOpenCallback={dialogOpenCallback}
        >
            <TextField
                autoFocus
                margin='dense'
                name='name'
                value={name}
                onChange={onChange}
                label={(
                    <span>
                        <FormattedMessage id='AdminPages.ApiCategories.AddEdit.form.name' defaultMessage='Name' />
                        <StyledSpan>*</StyledSpan>
                    </span>
                )}
                fullWidth
                error={hasErrors('name', name)}
                helperText={hasErrors('name', name)
                    || intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.name.helper.text',
                        defaultMessage: 'Name of the API category',
                    })}
                variant='outlined'
                disabled={editMode}
            />
            <TextField
                margin='dense'
                name='description'
                value={description}
                onChange={onChange}
                label={intl.formatMessage({
                    id: 'AdminPages.ApiCategories.AddEdit.form.description',
                    defaultMessage: 'Description',
                })}
                fullWidth
                multiline
                error={hasErrors('description', description)}
                helperText={hasErrors('description', description)
                    || intl.formatMessage({
                        id: 'AdminPages.ApiCategories.AddEdit.form.description.helper.text',
                        defaultMessage: 'Description of the API category',
                    })}
                variant='outlined'
            />
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
        name: PropTypes.string.isRequired,
    }),
    icon: PropTypes.element,
    triggerButtonText: PropTypes.oneOfType([
        PropTypes.element.isRequired,
        PropTypes.string.isRequired,
    ]).isRequired,
    title: PropTypes.shape({}).isRequired,
};

export default AddEdit;
