/* Sort 用の色々 */

class Square extends React.Component {
    render() {
        return (
            <button className="">
                {this.props.value}
            </button>
        );
    }
}

class ArrayBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            N: 8,
            squares: Array(8).fill(null)
        };
    }

    renderSquare(i) {
        return (<Square value={this.state.squares[i]} />);
    }

    render() {
        return (
            <div>
                <div className="array-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
            </div>
        );
    }
}

React.render(<ArrayBoard />, document.getElementById('test-react'));