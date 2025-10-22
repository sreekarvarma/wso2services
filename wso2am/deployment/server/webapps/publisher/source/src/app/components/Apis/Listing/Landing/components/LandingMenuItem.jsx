import React from 'react';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const PREFIX = 'LandingMenuItem';

const classes = {
    linkRoot: `${PREFIX}-linkRoot`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.linkRoot}`]: {
        color: theme.custom.landingPage.menu.primary,
        '&:hover': {
            backgroundColor: '#0B78F014',
            textDecoration: 'none',
        },
    }
}));

const LandingMenuItem = (props) => {
    const {
        helperText, children, id, linkTo, component = 'Link', onClick, dense, disabled = false,
    } = props;

    return (
        <StyledGrid
            item
            xs={12}
        >
            <Typography
                color='primary'
                variant={dense ? 'subtitle1' : 'h6'}
            >
                {/* Using React Router Links with Material-UI Links
                Pattern as suggested in https://material-ui.com/guides/composition/#link */}
                {component.toLowerCase() === 'link' && (
                    <Link
                        className={classes.linkRoot}
                        id={id}
                        component={RouterLink}
                        to={linkTo}
                        underline='hover'
                    >
                        {children}
                    </Link>
                )}
                {component.toLowerCase() === 'button' && (
                    <Button
                        disabled={disabled}
                        id={id}
                        size={dense ? 'small' : 'medium'}
                        onClick={onClick}
                        color='primary'
                        variant='outlined'
                    >
                        {children}
                    </Button>
                )}

            </Typography>
            <Box
                color='text.secondary'
                fontFamily='fontFamily'
                fontSize={dense ? 'caption.fontSize' : 'body2.fontSize'}
            >
                {helperText}
            </Box>
        </StyledGrid>
    );
};

export default LandingMenuItem;
