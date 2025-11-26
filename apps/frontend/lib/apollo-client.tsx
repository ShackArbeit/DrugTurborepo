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

// 根據目前執行環境決定要打哪一個 GraphQL Endpoint
function getGraphqlEndpoint(): string {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // 本機開發時（例如 http://localhost:3000）
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000/graphql';
    }

    // 其他情況（例如 http://114.29.236.11:3000）
    return 'http://114.29.236.11:4000/graphql';
  }

  // 安全預設值（通常用不到，但放著避免型別或 SSR 抱怨）
  return 'http://114.29.236.11:4000/graphql';
}

const httpLink = new HttpLink({
  uri: getGraphqlEndpoint(),
  fetch,
});

const authLink = setContext((_, { headers }) => {
  // 每次請求當下才讀 token（避免拿到舊值）
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
