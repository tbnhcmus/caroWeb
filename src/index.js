import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  function Square(props){
    console.log(props);
    let clName = props.win ? 'square win' : 'square';
    return(
      <button className={clName} onClick={props.onClick}>
        {props.value}
      </button>
    )
  }  
  class Board extends React.Component {
  
    renderRow(r){
      let row = [];
      let checkWin =false;
      for(let c = 0; c < this.props.size; ++c){
        if(this.props.line !== null) checkWin = this.props.line.indexOf(r * this.props.size + c) != -1 ? true : false;
        row.push(<Square 
          value={this.props.squares[r * this.props.size + c]}
          onClick={() => this.props.onClick(r * this.props.size + c)}
          win = {checkWin}
        />)
      }
      return(
        <div className="board-row">
          {row}
        </div>
      )
    }
  
    render() {
      let board = [];
      for(let i =0; i<this.props.size; ++i){
        board.push(this.renderRow(i));
      }
      return (
        <div>
          {board}
        </div>
      );
    }
  }
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(3 * 3).fill(null),
          pos: -1,
        }],
        xIsNext: true,
        stepNumber: 0,
        asc: false,
        size: '3',
      };
      this.handleChange = this.handleChange.bind(this);
    }
    handleClick(i){
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();
      const acs = this.state.asc;
      const [winner, line] = calculateWinner(squares, this.state.size);
      if(winner || squares[i]){
        return;
      }
      squares[i]= this.state.xIsNext ? 'X' : 'O';
      this.setState({
        history: history.concat([{
          squares: squares,
          pos: i,
        }]),
        xIsNext:!this.state.xIsNext,
        stepNumber : history.length,
        asc: acs,
        size: this.state.size,
      });
    }
    sortClick(){
      this.setState({
        history: this.state.history,
        xIsNext: this.state.xIsNext,
        stepNumber: this.state.stepNumber,
        asc: !this.state.asc,
        size: this.state.size,
      })
    }
    jumpTo(step) {
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
    }
    handleChange(event) {
      const siz =  parseInt(event.target.value);
      this.setState({
        history: [{
          squares: Array(siz * siz).fill(null),
          pos: -1,
        }],
        xIsNext: true,
        stepNumber: 0,
        asc: true,
        size: event.target.value,
      });
    }
    render() {
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const size = parseInt(this.state.size);
      const [winner, lin] = calculateWinner(current.squares, size);
      let listHis =[];
      let sortbutt='';
      const asc = this.state.asc;
      const moves = history.map((step, move) => {
        const pos = step.pos;
        const x = (pos - pos% size)/size;
        const y = pos %size;
        const acti =  move !== this.state.stepNumber ? '' : "actived";
        const desc = move ?
          'Go to move #' + move + '(' + x + ',' +y+ ')':
          'Go to game start';
        
        if(asc){
          sortbutt= "Sort descended";
          listHis.push(<li key ={move}>
            <button className = {acti} onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>)
        }
        else{
          sortbutt= "Sort ascended";
          listHis.unshift(<li key ={move}>
            <button className = {acti} onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>)
        }        
      });

      let status;
      if (winner) {
        status = 'Winner: ' + winner;
      } else if(this.state.stepNumber < size * size){
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
      else{
        status = 'Result: Draw';
      }
      let sizes=[];
      for(let i = 3; i< 20; i+=2){
        sizes.push(<option value={i.toString()}> {i}</option>)
      }
      return (
        <div className="game">
          <div className="game-board">
            <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            size = {size}
            line = {lin}
          />
          </div>
          <div className="game-info">
            <div><h2>{status}</h2></div>
            <select className ="long" value= {this.state.size} onChange={this.handleChange}>
              {sizes}
            </select>
            <button onClick={() => this.sortClick()} >{sortbutt}</button>
            <ol>{listHis}</ol>
          </div>
        </div>
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  
  function calculateWinner(squares, size) {
    if(size == 3){
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return [squares[a], lines[i]];
        }
      }
      return [null, null];
    }
    else{
      let board = [];
      for(let i =0; i<size; ++i){
        let row = [];
        for(let j = 0; j<size; ++j){
          row.push(squares[i*size +j]);
        }
        board.push(row);
      }
      for(let i =0; i<size; ++i){
        for(let j =0; j<size; ++j){
          if(j +4 <size && board[i][j] && board[i][j] === board[i][j+1] && board[i][j] === board[i][j+2] && board[i][j] === board[i][j+3] && board[i][j] === board[i][j+4]){
            let line = []
            for(let k =j; k<j+5; ++k) line.push(i*size + k);
            return [board[i][j], line];
          }
          if(i +4 <size && board[i][j] && board[i][j] === board[i+1][j] && board[i][j] === board[i+2][j] && board[i][j] === board[i+3][j] && board[i][j] === board[i+4][j]){
            let line = []
            for(let k =i; k<i+5; ++k) line.push(k*size + j);
            return [board[i][j], line];
          }
          if(i +4 <size && j + 4 <size && board[i][j] && board[i][j] === board[i+1][j +1] && board[i][j] === board[i+2][j +2] && board[i][j] === board[i+3][j +3] && board[i][j] === board[i+4][j+4]){
            let line = []
            for(let k =0; k<5; ++k) line.push((i+k)*size + j +k);
            return [board[i][j], line];
          }
          if(i +4 <size && j - 4 >=0 && board[i][j] && board[i][j] === board[i+1][j -1] && board[i][j] === board[i+2][j -2] && board[i][j] === board[i+3][j -3] && board[i][j] === board[i+4][j-4]){
            let line = []
            for(let k =0; k<5; ++k) line.push((i+k)*size + j -k);
            return [board[i][j], line];
          }
        }
      }
      return [null, null];
    }
    
    
  }