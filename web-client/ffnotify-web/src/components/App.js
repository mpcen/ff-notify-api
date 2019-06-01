import React, { Component } from 'react';
import io from 'socket.io-client';

class App extends Component {
    state = {
        socket: io('http://localhost:3001'),
        tweets: []
    };

    componentDidMount() {
        const { socket } = this.state;

        socket.on('new-tweet', tweets => {
            this.setState({
                tweets: [...tweets]
            });
        });
    }

    render() {
        return (
            <div>
                <h1>ff-notify client</h1>
                
                <ul>{this.renderList()}</ul>
            </div>
        );
    }

    renderList() {
        return this.state.tweets.map((tweet, i) => {
            return <li key={i}>{tweet.content}</li>;
        });
    }
}

export default App;