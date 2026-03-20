"use client";

import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    background-color: ${theme.colors.bg};
    color: ${theme.colors.text};
    font-family: ${theme.fonts.sans};
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  ::selection {
    background: ${theme.colors.primaryGlow};
    color: ${theme.colors.text};
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.bg};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: 3px;
  }
`;

export default GlobalStyle;
