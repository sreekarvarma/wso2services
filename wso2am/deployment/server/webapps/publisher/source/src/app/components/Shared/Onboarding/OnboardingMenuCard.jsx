
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Configurations from 'Config';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

const PREFIX = 'RestAPIMenu';

const classes = {
    boxTransition: `${PREFIX}-boxTransition`,
    overlayBox: `${PREFIX}-overlayBox`,
    overlayCloseButton: `${PREFIX}-overlayCloseButton`,
    actionStyle: `${PREFIX}-actionStyle`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.boxTransition}`]: {
        transition: 'box-shadow 0.9s cubic-bezier(.25,.8,.25,1)',
        cursor: 'pointer',
    },

    [`& .${classes.overlayBox}`]: {
        cursor: 'auto',
        outline: 'none',
        'border-color': '#f9f9f9', // TODO: take from theme ~tmkb
        'box-shadow': '0 0 6px 4px #f9f9f9',
        'border-radius': '5px',
    },

    [`& .${classes.overlayCloseButton}`]: {
        float: 'right',
    },

    [`& .${classes.actionStyle}`]: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    }
}));


const RestAPIMenu = (props) => {
    const {
        to, iconName, name, disabled, id,
    } = props;

    const [isHover, setIsHover] = useState(false);
    const onMouseOver = () => {
        setIsHover(true && !disabled);
    };
    const onMouseOut = () => {
        setIsHover(false);
    };
    const span = ({ children }) => <>{children}</>;
    const Component = disabled ? span : Link;

    return (
        <StyledGrid
            item
            xs={12}
            sm={5}
            md={3}
        >
            <Component
                id={id}
                color='inherit'
                underline='none'
                component={RouterLink}
                to={to}
            >
                <Box
                    className={classes.boxTransition}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    bgcolor='background.paper'
                    justifyContent='center'
                    alignItems='center'
                    borderRadius='8px'
                    borderColor='grey.300'
                    display='flex'
                    border={1}
                    boxShadow={isHover ? 4 : 1}
                    minHeight={440}
                    p={1}
                    fontSize='h4.fontSize'
                    fontFamily='fontFamily'
                    flexDirection='row'
                    position='relative'
                >
                    <Grid
                        container
                        direction='column'
                        justifyContent='space-between'
                        alignItems='center'
                    >
                        <Grid item xs={12}>
                            <Box
                                alignItems='center'
                                justifyContent='center'
                            >
                                <img
                                    width='190px'
                                    src={Configurations.app.context
                                        + iconName}
                                    alt={name}
                                    aria-hidden='true'
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} />
                        <Grid item xs={11}>
                            <Box
                                alignItems='center'
                                pt={15}
                                justifyContent='center'
                                color={disabled ? 'disabled' : 'primary.main'}
                            >
                                {name}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Component>
        </StyledGrid>
    );
};

RestAPIMenu.defaultProps = {
    iconName: 'add_circle',
    disabled: false,
};

export default RestAPIMenu;
