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
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Alert from 'AppComponents/Shared/Alert';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import cloneDeep from 'lodash.clonedeep';

import PermissionAPI from 'AppData/PermissionScopes';
import AddItem from './AddItem';
import SelectPermissionsStep from './SelectPermissionsStep';

const { ROLE_ALIAS, SELECT_PERMISSIONS } = SelectPermissionsStep.CONST;

/**
 *
 *
 * @export
 * @returns
 */
export default function AddRoleWizard(props) {
    const {
        appMappings, onClose, onRoleAdd, permissionMappings, roleAliases, setRoleAliases,
    } = props;

    const intl = useIntl();
    const [newRole, setNewRole] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [validation, setValidation] = useState({});
    const [permissionsValidation, setPermissionsValidation] = useState({});
    const [mappedRole, setMappedRole] = useState();
    const [permissionTypeSelection, setPermissionTypeSelection] = useState(ROLE_ALIAS);

    // No need an effect here due to the component structure
    const [localAppMappings, setLocalAppMappings] = useState(cloneDeep(appMappings));

    const [activeStep, setActiveStep] = React.useState(0);

    const permissionCheckHandler = (event) => {
        const {
            name: scopeName, checked, role: selectedRole, app,
        } = event.target;
        const newAppMappings = { ...localAppMappings };
        newAppMappings[app] = newAppMappings[app].map(({ name, roles, ...rest }) => {
            if (name === scopeName) {
                if (checked) {
                    return { ...rest, name, roles: [...roles, selectedRole] };
                } else {
                    return { ...rest, name, roles: roles.filter((role) => selectedRole !== role) };
                }
            } else {
                return { name, roles, ...rest };
            }
        });
        setPermissionsValidation({ ...permissionsValidation, [scopeName]: checked });
        setLocalAppMappings(newAppMappings);
    };
    const handleNext = () => {
        if (!validation.role && newRole) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else if (newRole === '') {
            Alert.warning(
                intl.formatMessage({
                    id: 'RolePermissions.Common.AddRoleWizard.add.role.warn.empty',
                    defaultMessage: 'Role name can not be empty!',
                }),
            );
        } else {
            Alert.warning(validation.role);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setLocalAppMappings(cloneDeep(appMappings));
    };

    /**
     * Handle the final step in the wizard, The `Save` action
     */
    const onAddRole = () => {
        setIsSaving(true);
        // Check if user has select at least one permission from the tree if the type is SELECT_PERMISSION
        if (permissionTypeSelection === SELECT_PERMISSIONS) {
            const permissionsValidationConditions = Object.values(permissionsValidation);
            if (!permissionsValidationConditions.length
                || !permissionsValidationConditions.reduce((acc, cu) => acc || cu)) {
                Alert.warning(intl.formatMessage({
                    id: 'RolePermissions.Common.AddRoleWizard.add.scope.error.empty.permission',
                    defaultMessage: 'You need to select at least one permission!',
                }));
                setIsSaving(false);
                return;
            }
            Promise.resolve(onRoleAdd(localAppMappings))
                .then(() => {
                    Alert.info(
                        <span>
                            {intl.formatMessage(
                                {
                                    id: 'RolePermissions.Common.AddRoleWizard.add.scope.success',
                                    defaultMessage: 'Added scope mapping for {newRole} successfully',
                                },
                                {
                                    newRole: <b>{` ${newRole} `}</b>,
                                },
                            )}
                        </span>,
                    );
                    onClose();
                })
                .catch((error) => {
                    Alert.error(
                        intl.formatMessage({
                            id: 'RolePermissions.Common.AddRoleWizard.add.scope.error',
                            defaultMessage: 'Something went wrong while adding new scope mapping',
                        }),
                    );
                    console.error(error);
                })
                .finally(() => setIsSaving(false));
        } else {
            if (!mappedRole) {
                Alert.warning(intl.formatMessage({
                    id: 'RolePermissions.Common.AddRoleWizard.add.scope.error.role.empty',
                    defaultMessage: 'Mapped role selection can\'t be empty!',
                }));
                setIsSaving(false);
                return;
            }
            const updatedRoleAliases = [...roleAliases.list];
            mappedRole.forEach((mappedRoleElement) => {
                const targetRole = updatedRoleAliases.find(({ role }) => role === mappedRoleElement);
                if (targetRole) {
                    targetRole.aliases.push(newRole);
                } else {
                    updatedRoleAliases.push({ role: mappedRoleElement, aliases: [newRole] });
                }
            });
            PermissionAPI.updateRoleAliases(updatedRoleAliases).then((response) => {
                setRoleAliases(response.body);
                Alert.info(
                    <span>
                        {intl.formatMessage(
                            {
                                id: 'RolePermissions.Common.AddRoleWizard.add.scope.error.add.role'
                                    + '.alias.success',
                                defaultMessage: 'Add new alias for {newRole} successfully',
                            },
                            {
                                newRole: <b>{` ${newRole} `}</b>,
                            },
                        )}
                    </span>,
                );
                onClose();
            }).catch((error) => {
                Alert.error(intl.formatMessage({
                    id: 'RolePermissions.Common.AddRoleWizard.add.scope.error.add.role.alias',
                    defaultMessage: 'Something went wrong while adding new role alias',
                }));
                console.error(error);
            }).finally(() => setIsSaving(false));
        }
    };

    return (
        <AddItem
            onSave={onAddRole}
            onClose={onClose}
            title={(
                <FormattedMessage
                    id='RolePermissions.Common.AddRoleWizard.add.mapping.title'
                    defaultMessage='Add new scope mapping'
                />
            )}
            buttonText={(
                <FormattedMessage
                    id='RolePermissions.Common.AddRoleWizard.add.mapping.button'
                    defaultMessage='Add scope mapping'
                />
            )}
            dialogProps={{ disableBackdropClick: isSaving, maxWidth: 'md' }}
            dialogActions={(
                <div style={{ marginBottom: '1rem' }}>
                    <div>
                        <Button
                            variant='outlined'
                            onClick={activeStep === 0 ? onClose : handleBack}
                            sx={{ mt: 1, mr: 1 }}
                            disabled={isSaving}
                        >
                            {activeStep === 0 ? (
                                <FormattedMessage
                                    id='RolePermissions.Common.AddRoleWizard.add.dialog.cancel'
                                    defaultMessage='Cancel'
                                />
                            ) : (
                                <FormattedMessage
                                    id='RolePermissions.Common.AddRoleWizard.add.dialog.back'
                                    defaultMessage='Back'
                                />
                            )}
                        </Button>
                        <Button
                            variant='contained'
                            disabled={isSaving}
                            color='primary'
                            onClick={activeStep === 1 ? onAddRole : handleNext}
                            sx={{ mt: 1, mr: 1 }}
                            data-testid='add-role-wizard-save-button'
                        >
                            {activeStep === 1 ? (
                                <>
                                    {isSaving && <CircularProgress size={16} />}
                                    {intl.formatMessage({
                                        id: 'RolePermissions.Common.AddRoleWizard.add.provide.role.save.btn',
                                        defaultMessage: 'Save',
                                    })}
                                </>
                            ) : intl.formatMessage({
                                id: 'RolePermissions.Common.AddRoleWizard.add.provide.role.next.btn',
                                defaultMessage: 'Next',
                            })}
                        </Button>
                    </div>
                </div>
            )}
        >
            <div style={{ width: '100%' }}>
                <Stepper activeStep={activeStep} orientation='vertical'>
                    {[
                        intl.formatMessage({
                            id: 'RolePermissions.Common.AddRoleWizard.add.provide.role.text',
                            defaultMessage: 'Provide role name',
                        }),
                        intl.formatMessage({
                            id: 'RolePermissions.Common.AddRoleWizard.add.provide.select.permissions',
                            defaultMessage: 'Select permissions',
                        }),
                    ].map((label, index) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                            <StepContent>

                                {
                                    (index === 0) && (
                                        <Box pt={3} width='40%'>
                                            <TextField
                                                id='role-input-field-helper-text'
                                                error={Boolean(validation.role)}
                                                value={newRole}
                                                fullWidth
                                                autoFocus
                                                size='small'
                                                label={intl.formatMessage({
                                                    id: 'RolePermissions.Common.AddRoleWizard.add.type.role.label',
                                                    defaultMessage: 'Role Name',
                                                })}
                                                helperText={
                                                    validation.role
                                                    || intl.formatMessage({
                                                        id: 'RolePermissions.Common.AddRoleWizard.add.type.role',
                                                        defaultMessage: 'Type existing user role, '
                                                            + ' If not create a new role from carbon console first',
                                                    })
                                                }
                                                variant='outlined'
                                                onChange={({ target: { value } }) => {
                                                    const trimmedValue = value.trim();
                                                    if (!trimmedValue) {
                                                        setValidation({ role: "Role name can't be empty!" });
                                                    } else if (permissionMappings[trimmedValue]) {
                                                        setValidation({ role: 'Permission mapping exist' });
                                                    } else {
                                                        setValidation({ role: false });
                                                    }
                                                    setNewRole(trimmedValue);
                                                }}
                                                onKeyDown={(event) => (event.which === 13
                                                    || event.keyCode === 13
                                                    || event.key === 'Enter')
                                                    && handleNext()}
                                            />
                                        </Box>
                                    )
                                }
                                {
                                    (index === 1) && (
                                        <>
                                            <SelectPermissionsStep
                                                onCheck={permissionCheckHandler}
                                                role={newRole}
                                                appMappings={localAppMappings}
                                                permissionMappings={permissionMappings}
                                                onMappedRoleSelect={setMappedRole}
                                                mappedRole={mappedRole}
                                                onPermissionTypeSelect={setPermissionTypeSelection}
                                                permissionType={permissionTypeSelection}
                                            />
                                        </>
                                    )
                                }
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            </div>
        </AddItem>
    );
}
