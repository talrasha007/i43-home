<template>
  <div>{{coin}} {{swapPositions}} {{futuresPositions}}</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Positions',
  props: ['coin'],
  computed: {
    ...mapState('okex', {
      swapPositions(state) {
        return state.swapPositions.filter(p => p.instrument_id.startsWith(this.coin + '-USD-'));
      },
      futuresPositions(state) {
        return state.futuresPositions.filter(p => p.instrument_id.startsWith(this.coin + '-USD-'));
      }
    })
  }
}
</script>

<style scoped>

</style>