import React, {FC, RefObject, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Text,
  View,
  SectionList,
  SectionListData,
  ViewStyle,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SectionListRenderItem,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native'
import Animated, {
  AnimatedStyleProp,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  Layout,
  SlideInDown,
  SlideInUp,
  StretchInY,
} from 'react-native-reanimated'
import styles from './styles'
import {ReceiptIcon, SearchIcon, StatsIcon} from 'assets/svg/icons'
import {scale} from 'react-native-size-matters'
import LinearGradient from 'react-native-linear-gradient'
import {SectionWithDate} from './Home'
import TransactionItem from './TransactionItem/TransactionItem'
import Header from './HomeHeader/HomeHeader'
import {getCurrencySymbol} from 'tools/getCountryInfo'
import {Colors} from 'styles/colors'
import {useTheme} from 'hooks/useTheme'
import {Ledger, Transaction} from 'types/state/user'
import {deviceSizes} from 'styles/dimensions'

const AnimatSectionList = Animated.createAnimatedComponent(SectionList)

const bottomBoundY = scale(310)

interface HomeViewProps {
  transactionsWithPeriods: Array<SectionWithDate>
  ledgers: Array<Ledger>
  chooseActiveLedger(index: number): void
  activeLedgerLocally: Ledger | undefined
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  accountAnimatedStyle: AnimatedStyleProp<ViewStyle>
  animatedScroll: AnimatedStyleProp<ViewStyle>
  listShadowGradientAnimatedStyle: AnimatedStyleProp<ViewStyle>
  listTopGradientAnimatedStyle: AnimatedStyleProp<ViewStyle>
  actionsAnimatedStyle: AnimatedStyleProp<ViewStyle>
  listHeaderAnimatedStyle: AnimatedStyleProp<ViewStyle>
  hiddenLedgerInfoAnimatedStyle: AnimatedStyleProp<ViewStyle>
  transactionsLoading: boolean
  listRef: RefObject<SectionList<Transaction, SectionWithDate>>
  onScrollBegin(): void
  onScrollEnd(index: number): void
  onProgressChange(offsetProgress: number, absoluteProgress: number): void
  transactionsLength: number
  onSendMoneyPress(): void
  onTransactionPress(transaction: Transaction): void
  loadMoreTransactions(): void
}
const HomeView: FC<HomeViewProps> = ({
  transactionsWithPeriods,
  ledgers = [],
  chooseActiveLedger,
  activeLedgerLocally,
  scrollHandler,
  accountAnimatedStyle,
  animatedScroll,
  listShadowGradientAnimatedStyle,
  listTopGradientAnimatedStyle,
  actionsAnimatedStyle,
  listHeaderAnimatedStyle,
  hiddenLedgerInfoAnimatedStyle,
  transactionsLoading,
  listRef,
  onScrollBegin,
  onScrollEnd,
  onProgressChange,
  transactionsLength,
  onSendMoneyPress,
  onTransactionPress,
  loadMoreTransactions,
}) => {
  const {appColors} = useTheme()

  const s = styles(appColors, ledgers.length)
  const {t} = useTranslation()

  const renderTransaction: SectionListRenderItem<Transaction, any> = ({
    item,
  }: {
    item: Transaction
    index: number
  }) => {
    if (transactionsWithPeriods.length === 0) return renderEmptyList()
    if ('emptyItem' in item) {
      const height =
        deviceSizes.height -
        (transactionsWithPeriods.length * scale(45) +
          transactionsLength * scale(66)) -
        bottomBoundY +
        scale(170) //marginTop

      return (
        <Animated.View
          style={[
            s.emptyItem,
            {
              height: height > scale(80) ? height : scale(80),
            },
          ]}
        />
      )
    } else {
      return (
        <TransactionItem
          date={item.actionKey}
          status={item.status}
          debit={item.debit}
          title={item.action}
          amount={`${item.credit ? '+' : '-'} ${getCurrencySymbol(
            item.currency
          )}${item.credit ? item.credit.toFixed(2) : item.debit.toFixed(2)}`}
          onPress={() => onTransactionPress(item)}
        />
      )
    }
  }

  const renderSectionTitle = ({
    section,
  }: {
    section: SectionListData<SectionWithDate, SectionWithDate>
  }) => {
    if ('emptyItem' in section.data[0]) return null

    const borderRadius = section.index === 0 ? scale(18.7) : undefined
    const paddingBottom = section.index === 0 ? scale(7) : scale(5)
    const paddingTop = section.index === 0 ? scale(18) : scale(15)

    return (
      <View
        style={[
          s.sectionTitleContainer,
          {
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            paddingBottom,
            paddingTop,
          },
        ]}>
        <Text style={s.sectionTitle}>{section.title}</Text>
        <View style={[s.stickyGradientContainer]}>
          <LinearGradient
            colors={[
              appColors.transactionStickyGradientTop,
              appColors.transactionStickyGradientBottom,
            ]}
            style={s.stickyGradient}
          />
        </View>
      </View>
    )
  }

  const renderStickyIcons = () => {
    return (
      <>
        <Animated.View
          style={[s.statsButtonContainer, listHeaderAnimatedStyle]}>
          <TouchableOpacity style={s.statsButton}>
            <StatsIcon fillColor={appColors.statsIcon} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[s.searchButtonContainer, listHeaderAnimatedStyle]}>
          <TouchableOpacity style={s.searchButton}>
            <SearchIcon fillColor={appColors.searchIcon} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[s.listTopGradientContainer, listTopGradientAnimatedStyle]}>
          <LinearGradient
            colors={[
              appColors.transactionStickyGradientTop,
              appColors.transactionStickyGradientBottom,
            ]}
            style={s.listTopGradient}
          />
        </Animated.View>
      </>
    )
  }

  const renderEmptyList = () => {
    return (
      <Animated.View style={s.emptyListContainer}>
        <View style={s.sectionTitleContainer}>
          <Text style={s.sectionTitle}>{t('Transactions')}</Text>
        </View>
        <View style={s.emptyListIconContainer}>
          <ReceiptIcon fillColor={Colors.whiteGray} />

          <Text style={s.emptyListText}>{t('There are no transactions')}</Text>
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={s.container}>
      {activeLedgerLocally ? (
        <>
          {transactionsWithPeriods.length ? renderStickyIcons() : null}
          <Animated.View
            style={[s.hiddenLedgerInfo, hiddenLedgerInfoAnimatedStyle]}>
            <Text style={s.ledgerName}>{activeLedgerLocally.title}</Text>
            <Text style={s.hiddenBalance}>{`${getCurrencySymbol(
              activeLedgerLocally.currency
            )}${activeLedgerLocally.available.toFixed(2)}`}</Text>
          </Animated.View>
        </>
      ) : null}
      <Animated.View
        style={[s.gradientContainer, listShadowGradientAnimatedStyle]}>
        <LinearGradient
          colors={[
            appColors.transactionGradientTop,
            appColors.transactionGradientBottom,
          ]}
          style={s.gradient}
        />
      </Animated.View>

      <Animated.View style={[s.transactionsContainer, animatedScroll]}>
        <AnimatSectionList
          onScroll={scrollHandler}
          renderToHardwareTextureAndroid
          //@ts-ignore
          ref={listRef}
          sections={[...transactionsWithPeriods, {data: [{emptyItem: true}]}]}
          //@ts-ignore
          renderItem={renderTransaction}
          //@ts-ignore
          keyExtractor={(item: Transaction) => item.actionKey}
          //@ts-ignore
          renderSectionHeader={renderSectionTitle}
          ListHeaderComponent={
            <Header
              accountAnimatedStyle={accountAnimatedStyle}
              actionsAnimatedStyle={actionsAnimatedStyle}
              chooseActiveLedger={chooseActiveLedger}
              ledgers={ledgers}
              onScrollBegin={onScrollBegin}
              onScrollEnd={onScrollEnd}
              onProgressChange={onProgressChange}
              activeLedgerLocally={activeLedgerLocally}
              transactionsLoading={transactionsLoading}
              onSendMoneyPress={onSendMoneyPress}
            />
          }
          ListEmptyComponent={renderEmptyList}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.transactionsContentContainer]}
          style={[s.transactions]}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          decelerationRate={'fast'}
          snapToEnd={false}
          snapToOffsets={[0, bottomBoundY]}
          pagingEnabled
          scrollEnabled={
            !!ledgers.length &&
            !!transactionsWithPeriods.length &&
            !transactionsLoading
          }
          ListFooterComponent={<View style={s.emptyBottom} />}
          ListFooterComponentStyle={s.emptyBottom}
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.3}
          // refreshControl={
          //   <RefreshControl refreshing={true} onRefresh={() => {}} />
          // }
        />
      </Animated.View>
    </View>
  )
}

export default HomeView
