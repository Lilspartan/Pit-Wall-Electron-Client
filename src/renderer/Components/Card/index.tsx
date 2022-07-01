/* eslint-disable react/destructuring-assignment */
const Card = (props: any) => {
    return (
        <div className="mx-4">
            <div className="transition duration-300 p-4 mt-8 bg-light-card-handle dark:bg-dark-card-handle flex flex-row justify-between select-none rounded-t-lg">
                <h1 className="font-bold cursor-default">
                    {props.title || 'Unnamed Window'}
                </h1>
            </div>
            <div className="transition duration-300 drop-shadow-lg backdrop-blur-sm px-8 pb-8 pt-4 rounded-b-lg bg-light-card-body dark:bg-dark-card-body origin-top">
                {props.children}
            </div>
        </div>
    );
};

export default Card;
