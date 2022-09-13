import React, {FC, useEffect, useMemo, useRef, useState} from 'react'
import HomeView from './HomeView'
import {StackScreenProps} from '@react-navigation/stack'
import moment from 'moment'
import {t} from 'i18next'
import {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import {scale} from 'react-native-size-matters'
import {LayoutAnimation, Platform, SectionList, UIManager} from 'react-native'
import {useUserRequests} from 'hooks/useUserRequests'
import {useAppStateValue} from 'state/StateContext'
import {StackParamList} from 'navigation/RootNavigation'
import {useLoading} from 'hooks/useLoading'
import {Ledger, Transaction} from 'types/state/user'
import useDebounce from 'hooks/useDebounce'
import {setActiveLedger} from 'state/actions/userActions'

type HomeProps = StackScreenProps<StackParamList>

export interface SectionWithDate {
  title: string
  data: Array<Transaction>
  date: Date
  index: number
}

const topBoundY = 0
const bottomBoundY = scale(310)
const marginTop = scale(120)
const gradientDiff = scale(15)
const smallGradientDiff = Platform.OS === 'ios' ? scale(10) : scale(4)
const translateHeaderY = -bottomBoundY + scale(175)
const hiddenLedgerInfoOffsets = {
  hidden: scale(110),
  visible: scale(45),
}

const getPeriods = (array: Array<Transaction> | undefined | null) => {
  if (Array.isArray(array)) {
    const sortedArray = array.sort((a, b) => {
      const dateA = new Date(a.actionKey)

      const dateB = new Date(b.actionKey)

      return dateB.getTime() - dateA.getTime()
    })
    const today = moment().startOf('day')
    const yesterday = moment(today).subtract(1, 'days')
    const result: Array<SectionWithDate> = []

    sortedArray.forEach((transaction: Transaction) => {
      const createdDate = new Date(transaction.created)
      const actionKeyDate = new Date(transaction.actionKey)
      const date =
        createdDate instanceof Date && !isNaN(createdDate.getTime())
          ? createdDate
          : actionKeyDate
      const transactionDate = moment(date)
      const sectionIndex = result.findIndex((section) =>
        moment(section.date).isSame(transactionDate, 'day')
      )

      if (sectionIndex !== -1) result[sectionIndex].data.push(transaction)
      else {
        const title = today.isSame(transactionDate, 'day')
          ? t('Today')
          : yesterday.isSame(transactionDate, 'day')
          ? t('Yesterday')
          : transactionDate.format(
              `Do MMMM${
                today.isSame(transactionDate, 'year')
                  ? ''
                  : transactionDate.format(' YYYY')
              }`
            )
        const index = result.length
        result.push({
          title: title,
          date: date,
          data: [transaction],
          index: index,
        })
      }
    })

    return result
  } else return []
}

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

const Home: FC<HomeProps> = ({navigation}) => {
  // const {appColors} = useTheme()

  const transactionsY = useSharedValue(topBoundY)
  const fixedAtTop = useSharedValue(0)
  const listRef = useRef<SectionList<Transaction, SectionWithDate>>(null)
  const [{userReducer}, dispatch] = useAppStateValue()
  const {getAccounts, getTransactions, getMoreTransactions} = useUserRequests()
  const transactionsLoading = useLoading()
  const [activeLedgerLocally, setActiveLedgerLocally] = useState(
    userReducer.accounts?.[0]
  )

  const [transactionsWithPeriods, setTransactionsWithPeriods] = useState(() =>
    getPeriods(
      userReducer.allTransactions?.[activeLedgerLocally?.account || '']
        ?.transactions || []
    )
  )

  const debouncedActiveLedgerLocally = useDebounce(activeLedgerLocally, 400)
  const memoizedTransactions = useMemo(
    () =>
      userReducer.allTransactions?.[activeLedgerLocally?.account || '']
        ?.transactions,
    [debouncedActiveLedgerLocally]
  )
  const gradientDefaultPosition = userReducer.accounts?.length
    ? bottomBoundY
    : scale(220)

  const accountAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            transactionsY.value,
            [0, bottomBoundY],
            [0, translateHeaderY],
            Extrapolate.CLAMP
          ),
        },
      ],
    }
  })
  const actionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        transactionsY.value,
        [topBoundY, bottomBoundY - 150], //300 and 150 are scroll offsets
        [1, 0]
      ),
    }
  })
  const animatedScroll = useAnimatedStyle(() => ({
    marginTop: interpolate(
      transactionsY.value,
      [0, bottomBoundY],
      [0, marginTop],
      Extrapolate.CLAMP
    ),
  }))
  const listHeaderAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      transactionsY.value,
      [-300, 0, bottomBoundY],
      [bottomBoundY + 300, bottomBoundY, marginTop],
      Extrapolate.CLAMP
    ),
  }))
  const listShadowGradientAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      transactionsY.value,
      [-300, 0, bottomBoundY],
      [
        bottomBoundY - gradientDiff + 300,
        gradientDefaultPosition - smallGradientDiff,
        marginTop - smallGradientDiff,
      ],
      Extrapolate.CLAMP
    ),
  }))
  const listTopGradientAnimatedStyle = useAnimatedStyle(() => ({
    top: interpolate(
      transactionsY.value,
      [-300, 0, bottomBoundY],
      [bottomBoundY + 300, gradientDefaultPosition, marginTop],
      Extrapolate.CLAMP
    ),
  }))
  const hiddenLedgerInfoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      transactionsY.value,
      [bottomBoundY / 2, bottomBoundY],
      [0, 1],
      Extrapolate.CLAMP
    ),
    top: interpolate(
      transactionsY.value,
      [bottomBoundY / 2, bottomBoundY],
      [
        marginTop + hiddenLedgerInfoOffsets.hidden,
        marginTop - hiddenLedgerInfoOffsets.visible,
      ],
      Extrapolate.CLAMP
    ),
  }))

  const scrollHandler = useAnimatedScrollHandler((event) => {
    fixedAtTop.value = event.contentOffset.y === bottomBoundY ? 1 : 0
    transactionsY.value = event.contentOffset.y
  })
  const scrollToTop = () => {
    if (
      listRef.current &&
      userReducer.accounts?.length &&
      transactionsWithPeriods.length
    )
      listRef.current.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        viewOffset: bottomBoundY,
      })
  }
  const onScrollBegin = () => {
    if (transactionsWithPeriods.length) scrollToTop()
  }
  const onScrollEnd = () => {
    transactionsLoading.finishLoading()
  }
  const onProgressChange = (_: number, absoluteProgress: number) => {
    if (Number.isInteger(absoluteProgress)) {
      if (transactionsLoading.isLoading) {
        transactionsLoading.finishLoading()
      }
    } else {
      if (!transactionsLoading.isLoading) {
        transactionsLoading.startLoading()
      }
    }
  }
  const chooseActiveLedger = (index: number) => {
    if (index && userReducer.accounts?.[index - 1]) {
      transactionsLoading.startLoading()
      setActiveLedgerLocally(userReducer.accounts?.[index - 1])
      dispatch(setActiveLedger(userReducer?.accounts?.[index - 1]))
      transactionsLoading.finishLoading()
    }
  }
  const onSendMoneyPress = () => {
    if (activeLedgerLocally)
      navigation.navigate('ChooseRecipient', {
        account: activeLedgerLocally,
      })
    // setTransactions((prev) => getPeriods([...prev, new Date()]))
  }
  const onTransactionPress = (transaction: Transaction) => {
    if (activeLedgerLocally) {
      navigation.navigate('TransactionDetails', {
        transaction,
        account: activeLedgerLocally,
      })
    }
  }

  const loadMoreTransactions = async () => {
    if (
      activeLedgerLocally &&
      userReducer.allTransactions?.[activeLedgerLocally.account].nextPage &&
      userReducer.allTransactions?.[activeLedgerLocally.account].transactions
    ) {
      const response = await getMoreTransactions(
        debouncedActiveLedgerLocally.account,
        {
          limit: 30,
          lastEvaluatedKey:
            userReducer.allTransactions?.[activeLedgerLocally.account]
              .transactions[
              userReducer.allTransactions?.[activeLedgerLocally.account]
                .transactions.length - 1
            ].actionKey,
        }
      )

      if (
        response.success &&
        response.data &&
        response.data.postings &&
        activeLedgerLocally?.account
      )
        setTransactionsWithPeriods(() => getPeriods(response.data.postings))
    }
  }

  const loadDefaultTransactions = async (ledger: Ledger) => {
    const response = await getTransactions(ledger.account, {
      limit: 30,
    })
    transactionsLoading.finishLoading()

    if (response.success && response.data && response.data.postings) {
      if (
        JSON.stringify(response.data.postings) !==
        JSON.stringify(memoizedTransactions)
      ) {
        LayoutAnimation.easeInEaseOut()
      }
      setTransactionsWithPeriods(() => getPeriods(response.data?.postings))
      // LayoutAnimation.easeInEaseOut()
    }
  }

  useEffect(() => {
    ;(async () => {
      const response = await getAccounts()
      if (response.success && response.data && !debouncedActiveLedgerLocally)
        setActiveLedgerLocally(response.data[0])
    })()
  }, [])

  useEffect(() => {
    if (
      activeLedgerLocally?.account &&
      userReducer?.allTransactions?.[activeLedgerLocally?.account]?.transactions
    )
      setTransactionsWithPeriods(() =>
        getPeriods(
          userReducer?.allTransactions?.[activeLedgerLocally?.account || '']
            ?.transactions
        )
      )
    else setTransactionsWithPeriods([])
  }, [])

  useEffect(() => {
    if (transactionsWithPeriods.length) scrollToTop()
  }, [transactionsLoading.isLoading])

  useEffect(() => {
    if (debouncedActiveLedgerLocally?.account) {
      setTransactionsWithPeriods(() =>
        getPeriods(
          userReducer.allTransactions?.[debouncedActiveLedgerLocally.account]
            ?.transactions
        )
      )
      transactionsLoading.startLoading()
      loadDefaultTransactions(debouncedActiveLedgerLocally)
    }
  }, [debouncedActiveLedgerLocally])

  useEffect(() => {
    if (activeLedgerLocally && userReducer.accounts) {
      const updatedActiveLedger = userReducer.accounts.find(
        (el) => el.account === activeLedgerLocally.account
      )
      if (
        updatedActiveLedger &&
        JSON.stringify(activeLedgerLocally) !==
          JSON.stringify(updatedActiveLedger)
      )
        setActiveLedgerLocally(updatedActiveLedger)
    }
  }, [userReducer.accounts])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // do something
      loadDefaultTransactions(debouncedActiveLedgerLocally)
    })

    return unsubscribe
  }, [navigation, debouncedActiveLedgerLocally])

  return (
    <HomeView
      transactionsWithPeriods={transactionsWithPeriods}
      ledgers={userReducer.accounts || []}
      chooseActiveLedger={chooseActiveLedger}
      activeLedgerLocally={activeLedgerLocally}
      scrollHandler={scrollHandler}
      accountAnimatedStyle={accountAnimatedStyle}
      animatedScroll={animatedScroll}
      listShadowGradientAnimatedStyle={listShadowGradientAnimatedStyle}
      listTopGradientAnimatedStyle={listTopGradientAnimatedStyle}
      actionsAnimatedStyle={actionsAnimatedStyle}
      listHeaderAnimatedStyle={listHeaderAnimatedStyle}
      hiddenLedgerInfoAnimatedStyle={hiddenLedgerInfoAnimatedStyle}
      transactionsLoading={transactionsLoading.isLoading}
      listRef={listRef}
      onScrollBegin={onScrollBegin}
      onScrollEnd={onScrollEnd}
      onProgressChange={onProgressChange}
      transactionsLength={
        userReducer.allTransactions?.[
          debouncedActiveLedgerLocally?.account || ''
        ]?.transactions?.length || 0
      }
      loadMoreTransactions={loadMoreTransactions}
      onSendMoneyPress={onSendMoneyPress}
      onTransactionPress={onTransactionPress}
    />
  )
}

export default Home
