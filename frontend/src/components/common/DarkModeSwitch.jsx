import React from "react";
import styled from "styled-components";
import { useTheme } from "../../context/ThemeContext";

const DarkModeSwitch = () => {
    const { darkMode, toggleTheme } = useTheme();

    return (
        <StyledWrapper>
            <label className="switch" title="Toggle dark mode">
                <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleTheme}
                />
                <span className="slider" />
            </label>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
    .switch {
        font-size: 17px;
        position: relative;
        display: inline-block;
        width: 3.5em;
        height: 2em;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        --background: ${(props) => props.theme.switchBg || "#28096b"};
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--background);
        transition: 0.5s;
        border-radius: 30px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 1.4em;
        width: 1.4em;
        border-radius: 50%;
        left: 10%;
        bottom: 15%;
        box-shadow: inset 8px -4px 0px 0px #fff000;
        background: var(--background);
        transition: 0.5s;
    }

    input:checked + .slider {
        background-color: #522ba7;
    }

    input:checked + .slider:before {
        transform: translateX(100%);
        box-shadow: inset 15px -4px 0px 15px #fff000;
    }
`;

export default DarkModeSwitch;
