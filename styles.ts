import {scale, ScaledSheet} from 'react-native-size-matters'
import {deviceSizes} from 'styles/dimensions'
import fonts from 'styles/fonts'
import {BorderRadiuses} from 'styles/globalStyles'
import scaledFontSizes from 'styles/scaledFontSizes'
import {LightComponentColors} from 'styles/colors'

export default (
  appColors: typeof LightComponentColors,
  ledgersLength: number
) => {
  return ScaledSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: appColors.homeBackground,
    },
    ledgerName: {
      fontFamily: fonts.openSans[600],
      fontSize: scaledFontSizes[14],
      color: appColors.textColor,
    },
    statsButtonContainer: {
      position: 'absolute',
      zIndex: 10,
      left: '22.4@s',
      justifyContent: 'center',
      marginTop: '15@s',
    },
    searchButtonContainer: {
      position: 'absolute',
      zIndex: 10,
      right: '22.4@s',
      marginTop: '15@s',
      justifyContent: 'center',
    },

    statsButton: {},
    searchButton: {},
    gradient: {
      width: deviceSizes.width,
      height: '40@vs',
      borderTopLeftRadius: BorderRadiuses.transactionsListShadow,
      borderTopRightRadius: BorderRadiuses.transactionsListShadow,
      borderColor: 'transparent',
    },
    gradientContainer: {
      position: 'absolute',
      zIndex: -1,
    },

    listTopGradient: {
      height: '10@s',
      width: deviceSizes.width / 1.2,
    },
    listTopGradientContainer: {
      position: 'absolute',
      zIndex: 120,
      alignItems: 'center',
      width: deviceSizes.width,
    },

    stickyGradient: {
      width: deviceSizes.width,
      height: '10@s',
    },
    stickyGradientContainer: {
      position: 'absolute',
      zIndex: 120,
      width: deviceSizes.width,
      bottom: -scale(9),
    },

    listHeaderButton: {
      borderTopLeftRadius: BorderRadiuses.transactionsList,
      borderTopRightRadius: BorderRadiuses.transactionsList,
      padding: '10@s',
    },
    transactions: {
      flex: 1,
      borderTopLeftRadius: BorderRadiuses.transactionsList,
      borderTopRightRadius: BorderRadiuses.transactionsList,
      borderColor: 'transparent',
      overflow: 'hidden',
    },
    transactionsContentContainer: {
      flexGrow: 1,
    },
    transactionsContainer: {
      flexGrow: 1,
      overflow: 'hidden',
      borderTopLeftRadius: BorderRadiuses.transactionsList,
      borderTopRightRadius: BorderRadiuses.transactionsList,
      borderColor: 'transparent',
    },
    sectionTitleContainer: {
      backgroundColor: appColors.transactionsBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontFamily: fonts.openSans[400],
      fontSize: scaledFontSizes[15],
      color: appColors.textColor,
    },

    emptyListContainer: {
      backgroundColor: appColors.transactionsBackground,
      height: deviceSizes.height - (ledgersLength ? scale(380) : scale(300)),
      alignItems: 'center',
      borderTopLeftRadius: BorderRadiuses.transactionsList,
      borderTopRightRadius: BorderRadiuses.transactionsList,
      borderColor: 'transparent',
      paddingBottom: '30@s',
    },
    emptyListIconContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyListText: {
      fontFamily: fonts.openSans[400],
      fontSize: scaledFontSizes[15],
      color: appColors.noTransactionsText,
      marginTop: '15@s',
    },
    emptyBottom: {
      backgroundColor: appColors.transactionsBackground,
      flex: 1,
    },
    emptyItem: {
      height: '250@vs',
      backgroundColor: appColors.transactionsBackground,
    },
    hiddenLedgerInfo: {
      alignItems: 'center',
      alignSelf: 'center',
      position: 'absolute',
    },
    hiddenBalance: {
      fontFamily: fonts.openSans[600],
      fontSize: scaledFontSizes[12],
      color: appColors.secondaryTextColor,
    },
  })
}
