import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    body {
        background-color: ${(props) => props.theme.body};
        color: ${(props) => props.theme.text};
        transition: all 0.3s ease-in-out;
    }

    .problemList {
        background-color: ${(props) => props.theme.body};
    }

    .tableWrapper {
        border-color: ${(props) => props.theme.border};
    }

    table {
        background-color: ${(props) => props.theme.body};
    }

    th {
        background-color: ${(props) => props.theme.tableHeader};
        color: ${(props) => props.theme.text};
        border-color: ${(props) => props.theme.border};
    }

    .problemRow {
        &:hover {
            background-color: ${(props) => props.theme.secondary};
        }
    }

    .problemRow td {
        border-color: ${(props) => props.theme.border};
        color: ${(props) => props.theme.text};
    }

    .filterSelect {
        background-color: ${(props) => props.theme.body};
        color: ${(props) => props.theme.text};
        border-color: ${(props) => props.theme.border};
    }
`;

export default GlobalStyle;
