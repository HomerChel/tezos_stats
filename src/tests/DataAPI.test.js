// import { render, screen } from '@testing-library/react';
import {DataAPI} from '../tezos/DataAPI';

test('first transaction timestamp', async () => {
  let timestamp = await (new DataAPI('tz1ZuRLk8zSwHB9T9FzDQqsiryXprLrH5xF2')).firstTransactionTime();
  expect(timestamp).toBe(1619213220000);
});

test('balance history', async () => {
  let history = await (new DataAPI('tz2JdzNsMwakjfMQE5U67CoSvBUyVB1govcZ')).balanceHistory();
  expect(history.length).toBe( Math.round((Date.now() - history[0].x) / (24*60*60*1000)) + 1);
});