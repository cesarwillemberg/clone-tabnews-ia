'use client';

import { Component } from 'react';

export default class ContentCountErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <span className="content-count-unavailable">
          Não foi possível carregar o total de conteúdos agora.
        </span>
      );
    }
    return this.props.children;
  }
}
