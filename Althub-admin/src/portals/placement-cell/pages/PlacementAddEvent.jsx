import EventForm from '../../shared/forms/EventForm.jsx';

export default function PlacementAddEvent() {
  return (
    <EventForm
      config={{
        title: 'Create Placement Event',
        subtitle: 'Fill in the details to publish a new placement event.',
        backPath: '/placement-events',
        successPath: '/placement-events',
      }}
    />
  );
}
