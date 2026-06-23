// The app's composed components for the command center — built on top of the vendored
// shadcn primitives in @/components/ui. These encode the design patterns shadcn doesn't
// cover directly: the warm raised Card baseline, the imperative modal shell/header over
// Dialog, the labelled money/date fields, the dashed add-row button, selectable chips,
// the radio pickers, and the per-color progress bar. Each is its own file; this barrel
// re-exports them under the @/components/composed import path. The warm/serif look lives
// in the theme CSS variables in globals.css.
export { Card } from "./Card";
export { ModalShell } from "./ModalShell";
export { ModalHeader } from "./ModalHeader";
export { FieldLabel } from "./FieldLabel";
export { TextInput } from "./TextInput";
export { MoneyInput } from "./MoneyInput";
export { DateInput } from "./DateInput";
export { AddRowBtn } from "./AddRowBtn";
export { Chip } from "./Chip";
export { FooterRow } from "./FooterRow";
export { FieldHalf } from "./FieldHalf";
export { OptionChips } from "./OptionChips";
export { PickerGroup, PickerRow } from "./Picker";
export { ProgressBar } from "./ProgressBar";
