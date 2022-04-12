import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableLocation,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import './App.css';
// import { CHARACTERS } from "./caractersData";

interface Item {
  id: string;
  content: string;
}

// fake data generator
const getItems = (count: number, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`,
  }));

const reorder = (list: Item[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (
  source: Item[],
  destination: Item[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {} as any;
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result as any;
};
const grid = 8;

const getItemStyle = (
  isDragging: boolean,
  draggingOver: string | undefined,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): React.CSSProperties | undefined => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? (draggingOver === '0' ? 'green' : 'blue') : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250,
});

function App() {
  const [state, setState] = useState([getItems(10), getItems(5, 10)]);

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter((group) => group.length));
    }
  }

  return (
    <div className="App">
      <div>
        <button
          type="button"
          onClick={() => {
            setState([...state, []]);
          }}
        >
          Add new group
        </button>
        <button
          type="button"
          onClick={() => {
            setState([...state, getItems(1)]);
          }}
        >
          Add new item
        </button>
      </div>
      <div className="Board">
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(providedRoot, snapshot) => (
                <div
                  ref={providedRoot.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...providedRoot.droppableProps}
                >
                  {el.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            snapshot.draggingOver,
                            provided.draggableProps.style
                          )}
                        >
                          {snapshot.isDragging ? (
                            snapshot.draggingOver === '0' ? (
                              <div>LEFT {snapshot.draggingOver}</div>
                            ) : snapshot.draggingOver === '1' ? (
                              <div>RIGHT {snapshot.draggingOver}</div>
                            ) : (
                              <div>None</div>
                            )
                          ) : (
                            <div
                              className={`Card ${
                                providedRoot.droppableProps[
                                  'data-rbd-droppable-id'
                                ] === '0'
                                  ? '-left'
                                  : '-right'
                              }`}
                            >
                              {item.content}
                              <button
                                type="button"
                                onClick={() => {
                                  const newState = [...state];
                                  newState[ind].splice(index, 1);
                                  setState(
                                    newState.filter((group) => group.length)
                                  );
                                }}
                              >
                                delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {providedRoot.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;
