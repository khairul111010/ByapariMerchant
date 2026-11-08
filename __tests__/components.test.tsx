import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import '../src/i18n';
import { Button } from '../src/ui';
import { Badge, StatusBadge } from '../src/ui/Badge';
import { EmptyState } from '../src/ui/EmptyState';
import { OrderCard } from '../src/ui/OrderCard';
import { orderRow } from '../test/samples';

/** All the visible text in a rendered tree, joined. */
const textOf = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root
    .findAll(n => typeof n.props.children === 'string' || typeof n.props.children === 'number')
    .map(n => String(n.props.children))
    .join(' | ');

function render(el: React.ReactElement) {
  let r!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    r = ReactTestRenderer.create(el);
  });
  return r;
}

describe('StatusBadge', () => {
  it.each([
    ['pending', 'Pending'],
    ['confirmed', 'Confirmed'],
    ['shipped', 'Shipped'],
    ['delivered', 'Delivered'],
    ['cancelled', 'Cancelled'],
  ] as const)('%s reads "%s" (colour is never the only signal)', (status, label) => {
    expect(textOf(render(<StatusBadge status={status} />))).toContain(label);
  });
});

describe('Badge', () => {
  it('shows its label and is announced as text', () => {
    const r = render(<Badge label="Paid" tone="success" />);
    // The helper sees the same text on the component and its native node, so compare the set.
    expect(new Set(textOf(r).split(' | '))).toEqual(new Set(['Paid']));
    expect(r.root.findByProps({ accessibilityLabel: 'Paid' })).toBeTruthy();
  });
});

describe('OrderCard', () => {
  it('shows number, total, customer and the three badges from a real order row', () => {
    const text = textOf(render(<OrderCard order={orderRow as never} onPress={() => undefined} />));
    for (const part of ['ORD-000001', '৳1,560', 'Sample Buyer', 'Pending', 'Unpaid', 'Cash on delivery']) {
      expect(text).toContain(part);
    }
  });
  it('is one button for screen readers, with a full summary', () => {
    const r = render(<OrderCard order={orderRow as never} onPress={() => undefined} />);
    const button = r.root.find(n => n.props.accessibilityRole === 'button' && typeof n.props.accessibilityLabel === 'string');
    expect(button.props.accessibilityLabel).toBe('ORD-000001, Sample Buyer, ৳1,560, Pending');
  });
  it('opens the order when tapped', () => {
    const onPress = jest.fn();
    const r = render(<OrderCard order={orderRow as never} onPress={onPress} />);
    act(() => r.root.find(n => n.props.accessibilityRole === 'button' && n.props.onPress).props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Button', () => {
  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)('%s renders its title', kind => {
    expect(textOf(render(<Button title="Save" kind={kind} onPress={() => undefined} />))).toContain('Save');
  });
  it('a disabled button reports it to screen readers and does not fire', () => {
    const onPress = jest.fn();
    const r = render(<Button title="Save" disabled onPress={onPress} />);
    const pressable = r.root.find(n => n.props.accessibilityRole === 'button' && n.props.accessibilityState);
    expect(pressable.props.accessibilityState).toMatchObject({ disabled: true });
    expect(pressable.props.disabled).toBe(true);
  });
  it('shows a spinner instead of the title while loading', () => {
    const r = render(<Button title="Save" loading onPress={() => undefined} />);
    expect(textOf(r)).not.toContain('Save');
  });
});

describe('EmptyState', () => {
  it('shows title, message and a working action', () => {
    const onAction = jest.fn();
    const r = render(<EmptyState title="No orders yet" message="New orders show up here." actionLabel="Add product" onAction={onAction} />);
    const text = textOf(r);
    expect(text).toContain('No orders yet');
    expect(text).toContain('New orders show up here.');
    act(() => r.root.find(n => n.props.accessibilityLabel === 'Add product' && n.props.onPress).props.onPress());
    expect(onAction).toHaveBeenCalled();
  });
  it('leaves the action out when there is no handler', () => {
    expect(textOf(render(<EmptyState title="Nothing" actionLabel="Go" />))).not.toContain('Go');
  });
});
