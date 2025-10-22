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
import React, {
    useReducer,
    useRef,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { styled, useTheme } from '@mui/material/styles';
import APIValidation from 'AppData/APIValidation';
import AddIcon from '@mui/icons-material/Add';
import Alert from 'AppComponents/Shared/Alert';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import ClearIcon from '@mui/icons-material/Clear';
import Fab from '@mui/material/Fab';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

const PREFIX = 'AddOperation';

const classes = {
    formControl: `${PREFIX}-formControl`,
    paper: `${PREFIX}-paper`,
    customMenu: `${PREFIX}-customMenu`,
    customButton: `${PREFIX}-customButton`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
    [`& .${classes.formControl}`]: {
        minWidth: 120,
    },

    [`&.${classes.paper}`]: {
        paddingLeft: theme.spacing(4),
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(0.5),
        marginTop: '12px',
    },

    [`& .${classes.customMenu}`]: {
        // '&:hover': { backgroundColor },
        // backgroundColor,
        // color: theme.palette.getContrastText(backgroundColor),
        minWidth: theme.spacing(9),
    },

    [`& .${classes.customButton}`]: {
        // '&:hover': { backgroundColor },
        // backgroundColor,
        width: theme.spacing(12),
        marginLeft: theme.spacing(1),
        // color: theme.palette.getContrastText(backgroundColor),
    }
}));

/**
 *
 *
 * @param {*} props
 * @returns
 */
function VerbElement(props) {
    const {
        verb, onClick, isButton, checked,
    } = props;

    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[verb.toLowerCase()];
    const textColor = theme.palette.getContrastText(backgroundColor);

    if (isButton) {
        return (
            <Button disableFocusRipple variant='contained' className={classes.customButton} size='small'
                sx={{ backgroundColor, color: textColor }}>
                {verb}
            </Button>
        );
    } else {
        return (
            <ListItem
                onClick={onClick}
                key={verb}
                button
                secondaryAction={
                    <Checkbox
                        onClick={onClick}
                        edge='end'
                        checked={checked}
                        inputProps={{
                            'aria-labelledby': verb,
                            id: `add-operation-${verb.toLowerCase()}`,
                        }}
                    />
                }
            >
                <Chip className={classes.customMenu} size='small' label={verb}
                    sx={{ backgroundColor, color: textColor }} />
            </ListItem>
        );
    }
}

const SUPPORTED_VERBS = {
    REST: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    WEBSUB: ['SUB'],
    SSE: ['SUB'],
    WS: ['PUB', 'SUB'],
};

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
function AddOperation(props) {
    const { operationsDispatcher, isAsyncAPI, api } = props;
    const inputLabel = useRef(null);
    const [labelWidth, setLabelWidth] = useState(0);
    const intl = useIntl();
    const isWebSub = api && api.type === 'WEBSUB';

    function getSupportedVerbs() {
        return isAsyncAPI ? SUPPORTED_VERBS[api.type] : SUPPORTED_VERBS.REST;
    }

    /**
     *
     *
     * @param {*} state
     * @param {*} action
     * @returns
     */
    function newOperationsReducer(state, action) {
        const { type, value } = action;
        switch (type) {
            case 'target':
            case 'verbs':
                return { ...state, [type]: value };
            case 'clear':
                return { verbs: [], target: '' };
            case 'error':
                return { ...state, error: value };
            default:
                return state;
        }
    }
    const [newOperations, newOperationsDispatcher] = useReducer(newOperationsReducer, { verbs: [] });
    React.useEffect(() => {
        setLabelWidth(inputLabel.current.offsetWidth);
    }, []);


    /**
     *
     *
     */
    function clearInputs() {
        newOperationsDispatcher({ type: 'clear' });
    }
    /**
     *
     *
     */
    function addOperation() {
        if (
            APIValidation.operationTarget.validate(newOperations.target).error !== null
            || APIValidation.operationVerbs.validate(newOperations.verbs).error !== null
        ) {
            if (isAsyncAPI) {
                Alert.warning(intl.formatMessage({
                    id: 'Apis.Details.Topics.components.AddOperation.operation.topic.or.type.cannot.be.empty.warning',
                    defaultMessage: "Topic name or topic type(s) can't be empty",
                }));
                return;
            }
            Alert.warning(intl.formatMessage({
                id: 'Apis.Details.Resources.components.AddOperation.operation.target.or.verb.cannot.be.empty.warning',
                defaultMessage: "Operation target or operation verb(s) can't be empty",
            }));
            return;
        }
        if (api && api.type && api.type.toLowerCase() === 'websub'
            && APIValidation.websubOperationTarget.validate(newOperations.target).error !== null) {
            Alert.warning(intl.formatMessage({
                id: 'Apis.Details.Resources.components.AddOperation.operation.topic.cannot.have.path.params.warning',
                defaultMessage: "WebSub topic can't have path parameters",
            }));
            return;
        }
        if (newOperations.target.indexOf(' ') >= 0) {
            Alert.warning(intl.formatMessage({
                id: 'Apis.Details.Resources.components.AddOperation.operation.target.cannot.contains.white.spaces',
                defaultMessage: 'Operation target cannot contains white spaces',
            }));
            return;
        }
        operationsDispatcher({ action: 'add', data: newOperations });
        clearInputs();
    }
    return (
        <StyledPaper className={classes.paper}>
            <Grid container direction='row' spacing={0} justifyContent='center' alignItems='center'>
                <Grid item md={5} xs={12}>
                    <FormControl margin='dense' variant='outlined' className={classes.formControl}>
                        <InputLabel ref={inputLabel} htmlFor='operation-verb'>
                            {isAsyncAPI && (
                                <FormattedMessage
                                    id='Apis.Details.Topics.components.AddOperation.op.type'
                                    defaultMessage='Type'
                                />
                            )}
                            {!isAsyncAPI && (
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.AddOperation.http.verb'
                                    defaultMessage='HTTP Verb'
                                />
                            )}
                        </InputLabel>

                        <Select
                            id='add-operation-selection-dropdown'
                            multiple
                            renderValue={(verbs) => {
                                const remaining = [];
                                const verbElements = verbs.map((verb, index) => {
                                    if (index < 2) {
                                        return <VerbElement isButton verb={verb} />;
                                    }
                                    remaining.push(verb.toUpperCase());
                                    return null;
                                });
                                const allSelected = getSupportedVerbs().length === newOperations.verbs.length;
                                return (
                                    <>
                                        {verbElements}
                                        {remaining.length > 0 && (
                                            <Tooltip title={remaining.join(', ')} placement='top'>
                                                <Box display='inline' color='text.hint' m={1} fontSize='subtitle1'>
                                                    {allSelected ? 'All selected' : `${verbs.length - 2} more`}
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </>
                                );
                            }}
                            value={newOperations.verbs}
                            onChange={({ target: { name, value } }) => newOperationsDispatcher({ type: name, value })}
                            labelWidth={labelWidth}
                            inputProps={{
                                name: 'verbs',
                                id: 'operation-verb',
                            }}
                            MenuProps={{
                                getContentAnchorEl: null,
                            }}
                        >
                            {getSupportedVerbs().map((verb) => (
                                <VerbElement
                                    checked={newOperations.verbs.includes(verb.toLowerCase())}
                                    value={verb.toLowerCase()}
                                    verb={verb}
                                />
                            ))}
                        </Select>

                        <FormHelperText id='my-helper-text'>
                            {newOperations.verbs.includes('options') && (
                                // TODO: Add i18n to tooltip text ~tmkb
                                <Tooltip
                                    title={intl.formatMessage({
                                        id: 'Apis.Details.Resources.components.AddOperation.option.title',
                                        defaultMessage: 'Select the OPTIONS method to send OPTIONS calls '
                                        + 'to the backend. If the OPTIONS method is not selected, '
                                        + 'OPTIONS calls will be returned from the Gateway with allowed methods.'
                                    }) }
                                    placement='bottom'
                                >
                                    <Badge color='error' variant='dot'>
                                        <FormattedMessage
                                            id='Apis.Details.Resources.components.AddOperation.option'
                                            defaultMessage='OPTIONS'
                                        />
                                    </Badge>
                                </Tooltip>
                            )}
                        </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item md={5} xs={8}>
                    <TextField
                        id='operation-target'
                        label={isAsyncAPI ? intl.formatMessage({
                            id: 'Apis.Details.Resources.components.AddOperation.operation.target.topic.name.label',
                            defaultMessage: 'Topic Name',
                        }) : intl.formatMessage({
                            id: 'Apis.Details.Resources.components.AddOperation.operation.target.uri.pattern.label',
                            defaultMessage: 'URI Pattern',
                        })}
                        error={Boolean(newOperations.error)}
                        autoFocus
                        name='target'
                        value={newOperations.target}
                        onChange={({ target: { name, value } }) => newOperationsDispatcher({
                            type: name,
                            value: !isWebSub && !value.startsWith('/') ? `/${value}` : value,
                        })}
                        placeholder={isAsyncAPI ? intl.formatMessage({
                            id: 'Apis.Details.Resources.components.AddOperation.operation.target.topic.name',
                            defaultMessage: 'Enter topic name',
                        }) : intl.formatMessage({
                            id: 'Apis.Details.Resources.components.AddOperation.operation.target.uri.pattern',
                            defaultMessage: 'Enter URI pattern',
                        })}
                        helperText={newOperations.error || (isAsyncAPI ? intl.formatMessage({
                            id: 'Apis.Details.Resources.components.AddOperation.operation.target.topic.name',
                            defaultMessage: 'Enter topic name',
                        }) : intl.formatMessage({
                            id: 'Apis.Details.Resources.components.AddOperation.operation.target.uri.pattern',
                            defaultMessage: 'Enter URI pattern',
                        }))}
                        fullWidth
                        margin='dense'
                        variant='outlined'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                // key code 13 is for `Enter` key
                                event.preventDefault(); // To prevent form submissions
                                addOperation();
                            }
                        }}
                    />
                </Grid>
                <Grid item md={2} xs={4}>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Resources.components.AddOperation.add.tooltip'
                                defaultMessage='Add new operation'
                            />
                        )}
                        placement='bottom'
                        interactive
                    >
                        <span>
                            <Fab
                                style={{ marginLeft: '20px', marginBottom: '15px', marginRight: '20px' }}
                                size='small'
                                color='primary'
                                aria-label='Add new operation'
                                onClick={addOperation}
                                id='add-operation-button'
                            >
                                <AddIcon />
                            </Fab>
                        </span>
                    </Tooltip>
                    <sup>
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='Apis.Details.Resources.components.AddOperation.clear.inputs.tooltip'
                                    defaultMessage='Clear inputs'
                                />
                            )}
                            placement='bottom'
                            interactive
                        >
                            <span>
                                <IconButton onClick={clearInputs} size='small' aria-label='clear-inputs'>
                                    <ClearIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </sup>
                </Grid>
            </Grid>
        </StyledPaper>
    );
}

AddOperation.propTypes = {
    operationsDispatcher: PropTypes.func.isRequired,
};

export default React.memo(AddOperation);
