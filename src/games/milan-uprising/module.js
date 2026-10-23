export const milanModule = Object.freeze({
  id: 'milan-uprising', version: '0.1.0', contractVersion: 1,
  modes: Object.freeze(['sandbox']),
  setup: profile => Object.fromEntries(profile.components.map(component => [component.id, null])),
  validate(state) {
    if (state.mode !== 'sandbox') throw Error('Automated Milan rules are not implemented yet');
  }
});
