/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

const Button = (props) => {
    if (props.link) {
        return (
            <a
                href={props.link}
                className={`${
                    props.block ? 'block' : ''
                } font-bold text-lg text-center cursor-pointer border-2 border-black dark:border-white px-4 py-2 rounded-lg transition duration-500 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black mx-4 my-2`}
            >
                {props.children}
            </a>
        );
    }
    return (
        <a
            onClick={props.click}
            className={`${
                props.block ? 'block' : ''
            } font-bold text-lg text-center cursor-pointer border-2 border-black dark:border-white px-4 py-2 rounded-lg transition duration-500 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black mx-4 my-2`}
        >
            {props.children}
        </a>
    );
};

export default Button;
