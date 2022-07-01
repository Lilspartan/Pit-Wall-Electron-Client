/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

type Link = {
    text: string;
    url: string;
};

type Props = {
    title?: string;
    body?: string;
    links?: Link[];
    permaDismiss: boolean;
    id: string;
};

const Alert = (props: Props) => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const localDismissed = localStorage.getItem(
            `alert-dismissed-${props.id}`
        );
        if (localDismissed !== null) setOpen(false);
    }, []);

    const close = () => {
        setOpen(false);

        if (props.permaDismiss)
            localStorage.setItem(`alert-dismissed-${props.id}`, 'true');
    };

    if (open) {
        return (
            <div className="flex flex-row justify-center w-full">
                <div className="p-4 fixed bg-light-card-handle text-black z-40 m-4 rounded-lg flex flex-row">
                    <div>
                        <span className="pr-2 font-bold">{props.title}</span>
                        <span>{props.body}</span>
                    </div>

                    <div>
                        <a className="cursor-pointer" onClick={close}>
                            <AiOutlineClose className="inline ml-4" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }
    return <></>;
};

export default Alert;
