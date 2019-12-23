import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Nav from 'yii-steroids/ui/nav/Nav';
import {getUser} from 'yii-steroids/reducers/auth';
import {getBaseCurrency, getPairName, getQuoteCurrency} from 'reducers/currency';

import {html, dal} from 'components';
import OrdersTable from './views/OrdersTable';
import BuyBondsForm from './views/BuyBondsForm';
import LiquidateBoundsForm from './views/LiquidateBoundsForm';
import OrderBook from './views/OrderBook';
// import MainChart from './views/MainChart';
// import CurrencyEnum from 'enums/CurrencyEnum';
import CollectionEnum from 'enums/CollectionEnum';
import OrderSchema from 'types/OrderSchema';
import UserSchema from 'types/UserSchema';

import './BondsDashboard.scss';

const bem = html.bem('BondsDashboard');

@dal.hoc(
    props => [
        {
            url: `/api/v1/bonds/${props.pairName}/orders`,
            key: 'bondOrders',
            collection: CollectionEnum.BONDS_ORDERS,
        },
        {
            url: `/api/v1/liquidate/${props.pairName}/orders`,
            key: 'liquidateOrders',
            collection: CollectionEnum.NEUTRINO_ORDERS,
        },
        props.user && {
            url: `/api/v1/bonds/user/${props.user.address}`,
            key: 'userOrders',
            collection: [
                CollectionEnum.BONDS_ORDERS,
                CollectionEnum.NEUTRINO_ORDERS,
            ],
        }
    ].filter(Boolean)
)
class BondsDashboard extends React.PureComponent {

    static propTypes = {
        bondOrders: PropTypes.arrayOf(OrderSchema),
        liquidateOrders: PropTypes.arrayOf(OrderSchema),
        user: UserSchema,
        userOrders: PropTypes.shape({
            opened: PropTypes.arrayOf(OrderSchema),
            history: PropTypes.arrayOf(OrderSchema),
        }),
    };

    constructor() {
        super(...arguments);

        this.state = {
            formTab: 'buy',
        };
    }

    render() {
        const { bondOrders, liquidateOrders } = this.props;
        if (!bondOrders || !liquidateOrders) {
            return null;
        }

        return (
            <div className={bem.block()}>
                <div className={bem.element('column', 'left')}>
                    <div className={bem.element('order-book')}>
                        <OrderBook
                            orders={this.state.formTab === 'buy' ? this.props.bondOrders : this.props.liquidateOrders}
                            user={this.props.user}
                            baseCurrency={this.props.baseCurrency}
                            quoteCurrency={this.props.quoteCurrency}
                            formTab={this.state.formTab}
                        />
                    </div>
                    <div className={bem.element('forms')}>
                        <Nav
                            isFullWidthTabs
                            layout={'tabs'}
                            onChange={formTab => this.setState({formTab})}
                            items={[
                                {
                                    id: 'buy',
                                    label: __('Buy'),
                                    content: BuyBondsForm,
                                    contentProps: {
                                        bondOrders
                                    }
                                },
                                {
                                    id: 'liquidate',
                                    label: __('Liquidate'),
                                    className: bem.element('danger-tab'),
                                    content: LiquidateBoundsForm,
                                },
                            ]}
                        />
                    </div>
                </div>
                <div className={bem.element('column', 'right')}>
                    <div className={bem.element('orders')}>
                        {this.props.userOrders && (
                            <Nav
                                className={bem.element('orders-nav')}
                                layout={'tabs'}
                                items={[
                                    {
                                        id: 'my-open-orders',
                                        label: __('My open Orders'),
                                        content: OrdersTable,
                                        contentProps: {
                                            items: this.props.userOrders.opened,
                                            pairName: this.props.pairName,
                                        }
                                    },
                                    {
                                        id: 'my-orders-history',
                                        label: __('My Orders History'),
                                        content: OrdersTable,
                                        contentProps: {
                                            items: this.props.userOrders.history,
                                            pairName: this.props.pairName,
                                            isHistory: true,
                                        }
                                    },
                                ]}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        pairName: getPairName(state),
        baseCurrency: getBaseCurrency(state),
        quoteCurrency: getQuoteCurrency(state),
        user: getUser(state),
    })
)(BondsDashboard);