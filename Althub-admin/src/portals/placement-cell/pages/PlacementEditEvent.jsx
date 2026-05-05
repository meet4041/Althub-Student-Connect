import EventForm from '../../shared/forms/EventForm.jsx';

export default function PlacementEditEvent() {
  return (
    <EventForm
      config={{
        mode: 'edit',
        editTitle: 'Edit Placement Event',
        subtitle: 'Update the placement event details and add new media.',
        backPath: '/placement-events',
        successPath: '/placement-events',
      }}
    />
  );
}
