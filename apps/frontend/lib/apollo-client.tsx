'use client';

import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

function getGraphqlEndpoint(): string {
  if (typeof window === 'undefined') {
    // SSR / 預設情況，本機開發時後端通常跑 3001
    return 'http://localhost:3001/graphql';
  }

  const { hostname } = window.location;

  // 🖥 本機開發環境 → Next 跑在 http://localhost:3000
  // 後端 NestJS 通常跑在 http://localhost:3001
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001/graphql';
  }

  // 🌐 VPS / 正式環境 → 走你 Kamatera 的 IP + 4000
  if (hostname === '114.29.236.11') {
    return 'http://114.29.236.11:4000/graphql';
  }

  // 其他情況（例如之後你掛網域）可以先暫時也指到 VPS 的 backend
  return `http://${hostname}:4000/graphql`;
}

const httpLink = new HttpLink({
  uri: getGraphqlEndpoint(),
  fetch,
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((e) => {
      console.warn(
        `[GraphQL error] op=${operation.operationName} message=${e.message}`,
        e.extensions,
      );
    });
  }
  if (networkError) {
    console.warn('[Network error]', networkError);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default function ApolloClientProvider({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
