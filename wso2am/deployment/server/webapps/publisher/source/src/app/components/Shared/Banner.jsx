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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { FormattedMessage } from 'react-intl';
import { orange, green } from '@mui/material/colors';
import { withRouter } from 'react-router';
import Fade from '@mui/material/Fade';

const PREFIX = 'Banner';

const classes = {
    xLarge: `${PREFIX}-xLarge`,
    warningIcon: `${PREFIX}-warningIcon`,
    checkCircleIcon: `${PREFIX}-checkCircleIcon`,
    infoIcon: `${PREFIX}-infoIcon`
};

const StyledFade = styled(Fade)((
    {
        theme
    }
) => ({
    [`& .${classes.xLarge}`]: {
        fontSize: theme.typography.pxToRem(64),
    },

    [`& .${classes.warningIcon}`]: {
        color: orange[500],
    },

    [`& .${classes.checkCircleIcon}`]: {
        color: green[800],
    },

    [`& .${classes.infoIcon}`]: {
        color: theme.palette.primary.dark,
    }
}));

/**
 *
 *
 * @export
 * @returns
 */
function Banner(props) {
    const {
        type, message, dense, history, paperProps, disableActions, open, onClose, disableClose,
    } = props;

    const [isOpen, setIsOpen] = useState(open);
    const iconProps = {};

    const defaultErrorMessages = {
        400: 'BAD REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT FOUND',
        500: 'INTERNAL SERVER ERROR',
        502: 'BAD GATEWAY',
    };

    const getDefaultErrorMessage = (code) => {
        return defaultErrorMessages[code] || 'ERROR';
    };


    if (dense) {
        iconProps.fontSize = 'large';
    } else {
        iconProps.className = classes.xLarge;
    }

    let bannerIcon = null;
    let { description } = message;

    let title;
    // TODO Check for an instance of FormattedMessage as well ~tmkb
    if (typeof message === 'string' || message instanceof String) {
        description = message;
        const [first, ...rest] = type;
        title = `${first.toUpperCase()}${rest.join('')}`; // Capitalize the first letter
    } else {
        // If `message` is an object, we expect it to be a REST API error response object
        title = `[${message.code}]: ${message.message || getDefaultErrorMessage(message.code)}`;
    }

    // IF add,remove or modify cases update the proptypes as well
    switch (type) {
        case 'error':
            bannerIcon = <ErrorIcon color='error' {...iconProps} />;
            break;
        case 'warning':
            bannerIcon = <WarningIcon className={classes.warningIcon} {...iconProps} />;
            break;
        case 'successes':
            bannerIcon = <CheckCircleIcon className={classes.checkCircleIcon} {...iconProps} />;
            break;
        case 'info':
            bannerIcon = <InfoIcon className={classes.infoIcon} {...iconProps} />;
            break;
        default:
            bannerIcon = <InfoIcon className={classes.infoIcon} {...iconProps} />;
            break;
    }
    return (
        <StyledFade in={isOpen} unmountOnExit>
            <Box clone pt={dense ? 1 : 2} pr={dense ? 0 : 1} pb={dense ? 0 : 1} pl={dense ? 1 : 2}>
                <Paper {...paperProps}>
                    <Grid container spacing={2} alignItems='center' wrap='nowrap'>
                        <Grid item>{bannerIcon}</Grid>
                        <Grid item>
                            <Typography variant='subtitle2' component='h3' display='block' gutterBottom>
                                {title}
                                <Typography variant='body1'>{description}</Typography>
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container justifyContent='flex-end' spacing={1}>
                        <Grid item>
                            {!disableActions && (
                                <>
                                    <Button onClick={() => history.goBack()} color='primary'>
                                        <FormattedMessage
                                            id='app.components.Shared.Banner.back'
                                            defaultMessage='Back'
                                        />
                                    </Button>
                                    <Button onClick={() => window.location.reload()} color='primary'>
                                        Refresh
                                    </Button>
                                </>
                            )}
                            {!disableClose && (
                                <Button onClick={onClose || (() => setIsOpen(false))} color='primary'>
                                    CLOSE
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </StyledFade>
    );
}
Banner.defaultProps = {
    dense: false,
    type: 'info',
    disableActions: false,
    paperProps: { elevation: 1 },
    open: true,
    onClose: null,
    disableClose: false,
};

Banner.propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'info', 'successes']),
    message: PropTypes.PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]).isRequired,
    dense: PropTypes.bool,
    open: PropTypes.bool,
    disableClose: PropTypes.bool,
    onClose: PropTypes.func,
    disableActions: PropTypes.bool,
    paperProps: PropTypes.shape({ elevation: PropTypes.number }),
    history: PropTypes.shape({ goBack: PropTypes.func }).isRequired,
};

export default withRouter(Banner);
