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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import deburr from 'lodash/deburr';
import Downshift from 'downshift';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import API from 'AppData/api';
import CONSTS from 'AppData/Constants';

const PREFIX = 'TenantAutocomplete';

const classes = {
    root: `${PREFIX}-root`,
    container: `${PREFIX}-container`,
    paper: `${PREFIX}-paper`,
    chip: `${PREFIX}-chip`,
    inputRoot: `${PREFIX}-inputRoot`,
    inputInput: `${PREFIX}-inputInput`,
    divider: `${PREFIX}-divider`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
    },

    [`&.${classes.container}`]: {
        flexGrow: 1,
        position: 'relative',
    },

    [`& .${classes.paper}`]: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(1),
        left: 0,
        right: 0,
    },

    [`& .${classes.chip}`]: {
        margin: theme.spacing(0.5, 0.25),
    },

    [`& .${classes.inputRoot}`]: {
        flexWrap: 'wrap',
    },

    [`& .${classes.inputInput}`]: {
        width: 'auto',
        flexGrow: 1,
    },

    [`& .${classes.divider}`]: {
        height: theme.spacing(2),
    }
}));

/**
 * Renders the input component
 */
function renderInput(inputProps) {
    const {
        InputProps, ref, ...other
    } = inputProps;

    return (
        <TextField
            InputProps={{
                inputRef: ref,
                classes: {
                    root: classes.inputRoot,
                    input: classes.inputInput,
                },
                ...InputProps,
            }}
            {...other}
        />
    );
}

renderInput.propTypes = {
    classes: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
    InputProps: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
};

/**
 * Renders the suggestion component
 */
function renderSuggestion(suggestionProps) {
    const {
        suggestion, index, itemProps, highlightedIndex, tenantList,
    } = suggestionProps;
    const isHighlighted = highlightedIndex === index;
    const isSelected = (tenantList || '').indexOf(suggestion) > -1;

    return (
        <MenuItem
            {...itemProps}
            key={suggestion}
            selected={isHighlighted}
            component='div'
            style={{
                fontWeight: isSelected ? 500 : 400,
            }}
        >
            {suggestion}
        </MenuItem>
    );
}

renderSuggestion.propTypes = {
    highlightedIndex: PropTypes.oneOfType([PropTypes.oneOf([null]), PropTypes.number]).isRequired,
    index: PropTypes.number.isRequired,
    itemProps: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
    tenantList: PropTypes.shape([]).isRequired,
    suggestion: PropTypes.string.isRequired,
};

/**
 * Gets suggestion list
 */
function getSuggestions(value, suggestions, { showEmpty = false } = {}) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0 && !showEmpty
        ? []
        : suggestions.filter((suggestion) => {
            const keep = count < 15 && suggestion.slice(0, inputLength).toLowerCase() === inputValue;
            if (keep) {
                count += 1;
            }
            return keep;
        });
}

/**
 * Downshift selection component
 */
function DownshiftMultiple(props) {
    const { tenantList, setTenantList } = props;
    const {  suggestions } = props;
    const [inputValue, setInputValue] = React.useState('');

    function handleKeyDown(event) {
        if (tenantList.length && !inputValue.length && event.key === 'Backspace') {
            setTenantList(tenantList.slice(0, tenantList.length - 1));
        }
    }

    function handleInputChange(event) {
        setInputValue(event.target.value);
    }

    function handleChange(item) {
        let newSelectedItem = [...tenantList];
        if (newSelectedItem.indexOf(item) === -1) {
            newSelectedItem = [...newSelectedItem, item];
        }
        setInputValue('');
        setTenantList(newSelectedItem);
    }

    const handleDelete = (item) => () => {
        const newSelectedItem = [...tenantList];
        newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
        setTenantList(newSelectedItem);
    };

    return (
        <Downshift
            id='downshift-multiple'
            inputValue={inputValue}
            onChange={handleChange}
            tenantList={tenantList}
        >
            {({
                getInputProps,
                getItemProps,
                getLabelProps,
                isOpen,
                inputValue: inputValue2,
                tenantList: tenantList2,
                highlightedIndex,
                getRootProps,
            }) => {
                const {
                    onBlur, onChange, onFocus, ...inputProps
                } = getInputProps({
                    onKeyDown: handleKeyDown,
                    placeholder: 'Type and select tenants from the suggested list',
                });

                return (
                    <Root className={classes.container} {...getRootProps({ }, { suppressRefError: true })}>
                        {renderInput({
                            fullWidth: true,
                            classes,
                            label: 'Tenants',
                            InputLabelProps: getLabelProps(),
                            InputProps: {
                                startAdornment: tenantList.map((item) => (
                                    <Chip
                                        key={item}
                                        tabIndex={-1}
                                        label={item}
                                        className={classes.chip}
                                        onDelete={handleDelete(item)}
                                    />
                                )),
                                onBlur,
                                onChange: (event) => {
                                    handleInputChange(event);
                                    onChange(event);
                                },
                                onFocus,
                            },
                            inputProps,
                        })}

                        {isOpen ? (
                            <Paper className={classes.paper} square>
                                {getSuggestions(inputValue2, suggestions).map((suggestion, index) => renderSuggestion({
                                    suggestion,
                                    index,
                                    itemProps: getItemProps({ item: suggestion }),
                                    highlightedIndex,
                                    tenantList: tenantList2,
                                }))}
                            </Paper>
                        ) : null}
                    </Root>
                );
            }}
        </Downshift>
    );
}

DownshiftMultiple.propTypes = {
    classes: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
    setTenantList: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
    suggestions: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
    tenantList: PropTypes.shape([]).isRequired,
};

/**
 * Gets tenant list in order to populate suggestions list
 */
export default function IntegrationDownshift(props) {

    const [suggestions, setsuggestions] = useState({});
    const { setTenantList, tenantList } = props;

    const restApi = new API();

    useEffect(() => {
        restApi.getTenantsByState(CONSTS.TENANT_STATE_ACTIVE)
            .then((result) => {
                const tenants = result.body.list;
                const newSuggestions = tenants.map((tenant) => { return tenant.domain; });
                setsuggestions(newSuggestions);
            });
    }, []);

    return (
        <div className={classes.root}>
            <div className={classes.divider} />
            <DownshiftMultiple
                classes={classes}
                suggestions={suggestions}
                tenantList={tenantList}
                setTenantList={setTenantList}
            />
            <div className={classes.divider} />
        </div>
    );
}

IntegrationDownshift.propTypes = {
    setTenantList: PropTypes.shape({
        type: PropTypes.string,
        inputType: PropTypes.string,
    }).isRequired,
    tenantList: PropTypes.shape([]).isRequired,
};
