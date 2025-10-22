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

import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { isRestricted } from 'AppData/AuthManager';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import Paper from '@mui/material/Paper';

const PREFIX = 'SchemaValidation';

const classes = {
    subHeading: `${PREFIX}-subHeading`,
    iconSpace: `${PREFIX}-iconSpace`,
    actionSpace: `${PREFIX}-actionSpace`,
    paper: `${PREFIX}-paper`
};

const StyledPaper = styled(Paper)((
    {
        theme
    }
) => ({
    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 400,
        margin: 0,
        display: 'inline-flex',
        lineHeight: 2.5,
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.actionSpace}`]: {
        marginLeft: theme.spacing(20),
    },

    [`&.${classes.paper}`]: {
        padding: theme.spacing(0, 3),
        marginBottom: theme.spacing(3),
    }
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
class SchemaValidation extends React.Component {
    /**
     *Creates an instance of SchemaValidation.
     * @param {*} props
     * @memberof SchemaValidation
     */
    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.setIsOpen = this.setIsOpen.bind(this);
    }

    /**
     *
     * @inheritdoc
     * @param {Object} prevProps
     * @param {Object} prevState
     * @memberof SchemaValidation
     */
    componentDidUpdate(prevProps) {
        const { api } = this.props;
        /*
        This could have been done using hooks too, But at the moment it requires `useRef` hook to get the previous props
        Hence using class component and its `componentDidUpdate` life cycle method to open the caution dialog box
        For more info: https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
         */
        if (!prevProps.api.enableSchemaValidation && api.enableSchemaValidation) {
            this.setIsOpen(true);
        }
    }

    /**
     *
     * Set isOpen state of the dialog box which shows the caution message when enabling schema validation
     * @param {Boolean} isOpen Should dialog box is open or not
     * @memberof SchemaValidation
     */
    setIsOpen(isOpen) {
        this.setState({ isOpen });
    }

    /**
     *
     * @inheritdoc
     * @param {*} props
     * @returns
     * @memberof SchemaValidation
     */
    render() {
        const { api, configDispatcher, } = this.props;
        const { isOpen } = this.state;
        const { api: apiFromContext } = this.context;

        return (
            <StyledPaper className={classes.paper}>
                <Grid container spacing={1} alignItems='flex-start'>
                    <Grid item md={12}>
                        <Typography className={classes.subHeading} variant='h6' component='h4'>
                            <FormattedMessage
                                id='Apis.Details.Configuration.Configuration.schema.validation'
                                defaultMessage='Schema Validation'
                            />
                            <Tooltip
                                title={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.schema.validation.tooltip'
                                        defaultMessage={'Enable the request and response '
                                        + 'validation against the OpenAPI definition'}
                                    />
                                )}
                                aria-label='Schema Validation helper text'
                                placement='right-end'
                                interactive
                            >
                                <HelpOutline className={classes.iconSpace} />
                            </Tooltip>
                        </Typography>
                        <FormControlLabel
                            className={classes.actionSpace}
                            control={(
                                <Switch
                                    disabled={isRestricted(['apim:api_create'], apiFromContext)}
                                    checked={
                                        api.enableSchemaValidation === undefined ? false : api.enableSchemaValidation
                                    }
                                    onChange={({ target: { checked } }) => configDispatcher({
                                        action: 'enableSchemaValidation',
                                        value: checked,
                                    })}
                                    color='primary'
                                    inputProps={{
                                        'aria-label': 'switch Schema Validation',
                                    }}
                                    id='schema-validation-switch'
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                <Dialog
                    open={isOpen}
                    onClose={() => this.setIsOpen(false)}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                >
                    <DialogTitle id='alert-dialog-title'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.SchemaValidation.title'
                            defaultMessage='Caution!'
                        />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                            <Typography variant='subtitle1' display='block' gutterBottom>
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.SchemaValidation.description'
                                    defaultMessage={
                                        'Enabling JSON schema validation will cause to build the'
                                        + ' payload in every request and response. This will impact'
                                        + ' the round trip time of an API request!'
                                    }
                                />
                            </Typography>
                            <Typography variant='subtitle2' display='block' gutterBottom>
                                <b>
                                    <FormattedMessage
                                        id={'Apis.Details.Configuration.components.SchemaValidation'
                                        + '.description.question'}
                                        defaultMessage='Do you want to enable schema validation?'
                                    />
                                </b>
                            </Typography>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color='primary'
                            variant='contained'
                            onClick={() => this.setIsOpen(false)}
                            id='schema-validation-yes-btn'
                        >
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.SchemaValidation.btn.yes'
                                defaultMessage='Yes'
                            />
                        </Button>
                        <Button
                            onClick={() => {
                                this.setIsOpen(false);
                                configDispatcher({
                                    action: 'enableSchemaValidation',
                                    value: false,
                                });
                            }}
                            color='primary'
                        >
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.SchemaValidation.btn.no'
                                defaultMessage='No'
                            />
                        </Button>
                    </DialogActions>
                </Dialog>
            </StyledPaper>
        );
    }
}

SchemaValidation.propTypes = {
    api: PropTypes.shape({ enableSchemaValidation: PropTypes.bool }).isRequired,
    configDispatcher: PropTypes.func.isRequired,
    classes: PropTypes.shape({}).isRequired,
};

SchemaValidation.contextType = ApiContext;

export default (SchemaValidation);
