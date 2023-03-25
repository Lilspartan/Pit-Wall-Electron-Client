import { useState, useEffect } from 'react';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import SVG from './icon';

let targetElement = null;

const LoadingIcon = ({ loading }: { loading: boolean }) => {
    const [fade, setFade] = useState(false);
    const [show, setShow] = useState(true);
    const [done, setDone] = useState(false);
    const [showLogo, setShowLogo] = useState(false);

    const fadeOut = () => {
        setFade(true);
        setTimeout(() => {
            setShow(false);
            enableBodyScroll(targetElement);
        }, 750);
    };

    useEffect(() => {
        targetElement = document.querySelector('body');
        disableBodyScroll(targetElement);
        setTimeout(() => {
            setShowLogo(true);
        }, 500);
    }, []);

    useEffect(() => {
        if (loading !== undefined && !loading && done) {
            fadeOut();
            // console.log(loading)
        }
    });

    if (show) {
        return (
            <div
                className={`
                background-c
                min-h-screen
                h-full
                absolute 
                z-40 
                overflow-hidden 
                ${fade ? 'fade-out ' : ''}
            `}
            >
                <div className="grid place-items-center h-screen text-center w-screen">
                    {showLogo ? (
                        <SVG
                            className="w-screen mb-16 md:mb-0 p-16 md:w-1/2 h-1/2"
                            onAnimationEnd={() => {
                                setDone(true);
                                if (loading === undefined) {
                                    fadeOut();
                                }
                            }}
                        />
                    ) : (
                        ''
                    )}
                </div>
            </div>
        );
    }

    return <></>;
};

export default LoadingIcon;
