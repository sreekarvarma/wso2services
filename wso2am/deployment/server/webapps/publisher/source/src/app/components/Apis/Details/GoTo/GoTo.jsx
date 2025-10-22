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
/* eslint object-shorthand: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

/* eslint no-unused-expressions: 0 */

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import { FormattedMessage, useIntl } from 'react-intl';
import Backdrop from '@mui/material/Backdrop';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import GoToSuggestions from 'AppComponents/Apis/Details/GoTo/Components/GoToSuggestions';

const PREFIX = 'GoTo';

const classes = {
    root: `${PREFIX}-root`,
    container: `${PREFIX}-container`,
    paper: `${PREFIX}-paper`,
    chip: `${PREFIX}-chip`,
    inputRoot: `${PREFIX}-inputRoot`,
    inputInput: `${PREFIX}-inputInput`,
    divider: `${PREFIX}-divider`,
    linkButton: `${PREFIX}-linkButton`,
    goToWrapper: `${PREFIX}-goToWrapper`,
    downshiftWrapper: `${PREFIX}-downshiftWrapper`,
    backdrop: `${PREFIX}-backdrop`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
    },

    [`& .${classes.container}`]: {
        flexGrow: 1,
        position: 'relative',
    },

    [`& .${classes.paper}`]: {
        position: 'absolute',
        zIndex: theme.zIndex.goToSearch,
        marginTop: theme.spacing(2),
        padding: theme.spacing(1),
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
        fontSize: '20px',
    },

    [`& .${classes.divider}`]: {
        height: theme.spacing(2),
    },

    [`& .${classes.linkButton}`]: {
        display: 'grid',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 10,
        cursor: 'pointer',
        minWidth: 30,
    },

    [`&.${classes.goToWrapper}`]: {
        position: 'relative',
    },

    [`& .${classes.downshiftWrapper}`]: {
        padding: theme.spacing(1),
        background: theme.palette.background.paper,
        borderRadius: 10,
        width: '70vw',
        marginBottom: '20%',
        boxShadow: '0px 0px 20px 3px rgb(0 0 0 / 56%)',
    },

    [`& .${classes.backdrop}`]: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backdropFilter: 'blur(1px)',
    }
}));

/**
 * Method to render the input of the user
 * @param {*} inputProps inputProps
 * @returns {*} TextField
 */
function renderInput(inputProps) {
    const {
        InputProps, ref, ...other
    } = inputProps;

    return (
        <TextField
            variant='outlined'
            autoFocus
            InputProps={{
                inputRef: ref,
                autoFocus: true,
                classes: {
                    root: classes.inputRoot,
                    input: classes.inputInput,
                },
                startAdornment: (
                    <InputAdornment position='start'>
                        <SearchIcon color='disabled' fontSize='large' />
                    </InputAdornment>
                ),
                ...InputProps,
            }}
            {...other}
        />
    );
}

renderInput.propTypes = {
    /**
     * Override or extend the styles applied to the component.
     */
    classes: PropTypes.shape({}).isRequired,
    InputProps: PropTypes.shape({}).isRequired,
};

/**
 * Method to render the GoTo search feature
 * @param {*} props props param
 * @returns {*} Downshift element
 */
function GoTo(props) {
    const {
        isAPIProduct, api, openPageSearch, setOpenPageSearch,
    } = props;

    const [showSearch, setShowSearch] = useState(openPageSearch);
    const intl = useIntl();
    useEffect(() => {
        setShowSearch(openPageSearch);
    }, [openPageSearch]);
    let isGraphQL = false;

    if (api.type === 'GRAPHQL') {
        isGraphQL = true;
    }
    const toggleSearch = () => {
        setShowSearch(!showSearch);
    };
    const handleClickAway = () => {
        setShowSearch(false);
        setOpenPageSearch(false);
    };

    return (
        <Root className={classes.goToWrapper}>
            <Button className={classes.linkButton} onClick={toggleSearch}>
                <Icon>find_in_page</Icon>
                <Typography variant='caption'>
                    <FormattedMessage id='Apis.Details.GoTo.GoTo.btn' defaultMessage='Go To' />
                </Typography>
            </Button>
            <Backdrop className={classes.backdrop} open={showSearch} onClick={handleClickAway}>
                <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className={classes.downshiftWrapper}>
                    {showSearch && (
                        <Downshift id='page-search'>
                            {({
                                getInputProps,
                                getItemProps,
                                getLabelProps,
                                getMenuProps,
                                highlightedIndex,
                                inputValue,
                                isOpen,
                                selectedItem,
                            }) => {
                                const { onBlur, onFocus, ...inputProps } = getInputProps({
                                    placeholder: intl.formatMessage({
                                        id: 'Apis.Details.GoTo.button.placeholder',
                                        defaultMessage: 'Page Search',
                                    }),
                                });

                                return (
                                    <div className={classes.container}>
                                        {renderInput({
                                            fullWidth: true,
                                            classes,
                                            InputLabelProps: getLabelProps({ shrink: true }),
                                            InputProps: { onBlur, onFocus },
                                            inputProps,
                                        })}

                                        <div {...getMenuProps()}>
                                            {isOpen ? (
                                                <GoToSuggestions
                                                    inputValue={inputValue}
                                                    isAPIProduct={isAPIProduct}
                                                    isGraphQL={isGraphQL}
                                                    getItemProps={getItemProps}
                                                    highlightedIndex={highlightedIndex}
                                                    selectedItem={selectedItem}
                                                    handleClickAway={handleClickAway}
                                                    apiId={api.id}
                                                />
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            }}
                        </Downshift>
                    )}
                </div>
            </Backdrop>
        </Root>
    );
}

GoTo.propTypes = {
    api: PropTypes.shape({}).isRequired,
};

export default GoTo;
